import { useQuery } from '@apollo/client'
import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { BEACON_NODE_URL } from '@/constants/chains'
import client from '@/graphql/client'
import { getStakehouseAccount } from '@/graphql/queries/lsdValidators'
import { LsdRagequitAssistant } from '@/graphql/queries/NodeRunners'
import { NodeRunnerByValidatorQuery } from '@/graphql/queries/NodeRunnersQuery'
import { BalanceReportT } from '@/types'
import { bigToNum, handleErr, notifyHash } from '@/utils/global'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useRagequit = (blsKey?: string) => {
  const { sdk } = useSDK()
  const { isGnosis, account } = useCustomAccount()

  const [eligible, setEligible] = useState(true)
  const [requiredDETH, setRequiredDETH] = useState<BigNumber>()
  const [isLoading, setLoading] = useState(false)
  const [firstLoading, setFirstLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [fetchAuthenticatedReportError, setFetchAuthenticatedReportError] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [waitUnstakeModal, setWaitUnstakeModal] = useState(0)
  const [isUnstakable, setUnstakable] = useState(false)
  const [topUpRequired, setTopUpRequired] = useState([])
  const [loadingTopup, setLoadingTopup] = useState(false)

  const { data: { lsdvalidator } = {} } = useQuery(NodeRunnerByValidatorQuery, {
    variables: { address: blsKey },
    skip: !blsKey
  })
  const { data: { stakehouseAccount } = {} } = useQuery(getStakehouseAccount, {
    variables: { blsPublicKey: blsKey },
    skip: !blsKey
  })

  const fetchAuthenticatedReport = useCallback(async () => {
    if (sdk && blsKey && lsdvalidator) {
      setFirstLoading(true)

      const stepStatus = await sdk.utils.getValidatorLifecycleStatus(blsKey)

      if (stepStatus === 4) {
        setCurrentStep(4)
        setFirstLoading(false)
        return
      }

      let rageQuitAssistantAddress
      try {
        const feesAndMevPool = lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool
        rageQuitAssistantAddress = await sdk.wizard.getRageQuitAssistantForBLSPublicKey(
          feesAndMevPool,
          blsKey
        )

        if (Number(rageQuitAssistantAddress) !== 0) {
          const { data: { lsdrageQuitAssistant } = {} } = await client.query({
            query: LsdRagequitAssistant,
            variables: {
              rageQuitAssistantAddress: rageQuitAssistantAddress.toLowerCase()
            }
          })
          const dETHForIsolation = await sdk.utils.dETHRequiredForIsolation(blsKey)

          const requiredDETH = dETHForIsolation.sub(
            BigNumber.from(lsdrageQuitAssistant.dETHBorrowed)
          )
          if (bigToNum(requiredDETH) === 0) {
            setCurrentStep(3)
          } else {
            setCurrentStep(2)
          }
        }
      } catch (err) {
        console.log('getRageQuitAssistantForBLSPublicKey error: ', err)
        throw err
      }

      setFirstLoading(false)
    }
  }, [sdk, blsKey, lsdvalidator])

  useEffect(() => {
    fetchAuthenticatedReport()
  }, [fetchAuthenticatedReport])

  const handleDeployAssistant = useCallback(async () => {
    if (sdk && lsdvalidator) {
      setLoading(true)
      let authenticatedReport: BalanceReportT
      try {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          blsKey
        )
        authenticatedReport = await sdk.balanceReport.authenticateReport(
          BEACON_NODE_URL,
          finalisedEpochReport
        )
      } catch (err) {
        console.log('fetch authenticated report error: ', err)
        setFetchAuthenticatedReportError(true)
        return
      }

      try {
        const feesAndMevPool = lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool
        const tx = await sdk.wizard.deployRageQuitAssistant(
          feesAndMevPool,
          true,
          authenticatedReport
        )
        if (!isGnosis) notifyHash(tx.hash)
        await tx.wait()
        setCurrentStep(2)
      } catch (err) {
        console.log('handleDeployAssistant error: ', err)
        try {
          const feesAndMevPool = lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool

          const tx = await sdk.wizard.deployRageQuitAssistantForExitedValidator(
            feesAndMevPool,
            blsKey
          )
          if (!isGnosis) notifyHash(tx.hash)
          await tx.wait()
          setCurrentStep(2)
        } catch (error) {
          console.log('handleDeployAssistantForExitedValidator error: ', err)
          setError(handleErr(err, 'Something went wrong.'))
        }
      }
      setLoading(false)
    }
  }, [sdk, lsdvalidator])

  const handleTopUpDETH = useCallback(async () => {
    if (sdk && requiredDETH) {
      setLoading(true)
      try {
        const feesAndMevPool = lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool
        const rageQuitAssistantAddress = await sdk.wizard.getRageQuitAssistantForBLSPublicKey(
          feesAndMevPool,
          blsKey
        )
        const dETH = (await sdk.contractInstance).dETHContract()

        const allowanceTx = await dETH.approve(rageQuitAssistantAddress, requiredDETH)
        if (!isGnosis) notifyHash(allowanceTx.hash)
        await allowanceTx.wait()

        const depositDETHTx = await sdk.wizard.depositDETHInRageQuitAssistant(
          rageQuitAssistantAddress,
          requiredDETH
        )
        if (!isGnosis) notifyHash(depositDETHTx.hash)
        await depositDETHTx.wait(2)
        setCurrentStep(3)
      } catch (err) {
        console.log('handleBorrowEligibilityCheck error: ', err)
      }
      setLoading(false)
    }
  }, [sdk, requiredDETH])

  const handleBorrowDETH = useCallback(async () => {
    if (sdk && lsdvalidator && blsKey && lsdvalidator) {
      const feesAndMevPool = lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool

      setLoading(true)
      try {
        const rageQuitAssistantAddress = await sdk.wizard.getRageQuitAssistantForBLSPublicKey(
          feesAndMevPool,
          blsKey
        )

        const { data: { lsdrageQuitAssistant } = {} } = await client.query({
          query: LsdRagequitAssistant,
          variables: {
            rageQuitAssistantAddress: rageQuitAssistantAddress.toLowerCase()
          }
        })

        const dETHForIsolation = await sdk.utils.dETHRequiredForIsolation(blsKey)

        const requiredDETH = dETHForIsolation.sub(BigNumber.from(lsdrageQuitAssistant.dETHBorrowed))

        if (bigToNum(requiredDETH) > 0) {
          setEligible(false)
          setRequiredDETH(requiredDETH)
        } else {
          setCurrentStep(3)
        }
      } catch (err) {
        console.log('handleBorrowDETH error: ', err)
        setError(handleErr(err, 'Something went wrong.'))
      }
      setLoading(false)
    }
  }, [sdk, lsdvalidator, blsKey, lsdvalidator])

  const handleTopUpSlashedSlot = useCallback(async () => {
    if (!blsKey || !account || !stakehouseAccount || !sdk) return

    setLoadingTopup(true)
    try {
      const { stakeHouse } = stakehouseAccount
      await Promise.all(
        topUpRequired.map(async ({ blsPublicKey, amount }) => {
          const tx = await sdk.utils.topUpSlashedSlot(
            stakeHouse,
            blsPublicKey,
            account.address,
            amount,
            amount
          )
          notifyHash(tx.hash)
          await tx.wait()
        })
      )
    } catch (err) {
      console.log('handleTopUp error: ', err)
    }

    setLoadingTopup(false)
    setTopUpRequired([])
  }, [sdk, stakehouseAccount, blsKey, account, topUpRequired])

  const handleWithdrawValidator = useCallback(async () => {
    if (sdk && lsdvalidator && stakehouseAccount && blsKey && account) {
      setLoading(true)

      try {
        const { stakeHouse } = stakehouseAccount
        const result = await sdk.utils.minimumTopUpRequired(stakeHouse, account.address)
        if (result.length > 0) {
          setTopUpRequired(result)
          setLoading(false)
          return
        }
      } catch (err) {
        console.log('minimumTopUpRequired error: ', err)
      }

      let authenticatedReport: BalanceReportT
      try {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          blsKey
        )
        authenticatedReport = await sdk.balanceReport.authenticateReport(
          BEACON_NODE_URL,
          finalisedEpochReport
        )
      } catch (err) {
        console.log('handleWithdrawValidator error: ', err)
        setFetchAuthenticatedReportError(true)
        return
      }

      try {
        const liquidStakingManagerAddress = lsdvalidator.smartWallet.liquidStakingNetwork.id
        const ethValue = await sdk.utils.topUpAmountForRageQuit(BEACON_NODE_URL, blsKey)
        const txResult = await sdk.wizard.rageQuit(
          liquidStakingManagerAddress,
          blsKey,
          authenticatedReport,
          ethValue
        )

        if (!isGnosis) notifyHash(txResult.hash)
        await txResult.wait()
        setCurrentStep(4)
      } catch (err) {
        console.log('handleWithdrawValidator error: ', err)
        setError(handleErr(err, 'Something went wrong.'))
      }
      setLoading(false)
    }
  }, [sdk, lsdvalidator, stakehouseAccount, blsKey, account])

  const handleUnstakeETH = useCallback(async () => {
    if (sdk && blsKey && lsdvalidator && stakehouseAccount) {
      setLoading(true)
      let authenticatedReport: BalanceReportT
      try {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          blsKey
        )
        authenticatedReport = await sdk.balanceReport.authenticateReport(
          BEACON_NODE_URL,
          finalisedEpochReport
        )
      } catch (err) {
        console.log('handleWithdrawValidator error: ', err)
        setFetchAuthenticatedReportError(true)
        return
      }

      const { withdrawalEpoch, currentCheckpointEpoch, activeBalance } = authenticatedReport.report

      if (Number(withdrawalEpoch) - currentCheckpointEpoch > 0) {
        setLoading(false)
        return setWaitUnstakeModal((Number(withdrawalEpoch) - currentCheckpointEpoch) * 32 * 12)
      }

      if (Number(activeBalance) !== 0) {
        setLoading(false)
        return setUnstakable(true)
      }

      try {
        let finalisedReport
        try {
          finalisedReport = await sdk.balanceReport.getFinalisedEpochReport(BEACON_NODE_URL, blsKey)
        } catch (err) {
          console.log('getFinalisedEpochReport error: ', err)
          throw err
        }
        const validatorIndex = finalisedReport.validatorIndex

        let totalETHSentToBLSPublicKey
        try {
          totalETHSentToBLSPublicKey = await sdk.balanceReport.getTotalETHSentToBlsKey(blsKey)
          totalETHSentToBLSPublicKey = totalETHSentToBLSPublicKey.toString()
        } catch (err) {
          console.log('getTotalETHSentToBlsKey error: ', err)
          throw err
        }

        let slotIndexes
        try {
          slotIndexes = await sdk.balanceReport.getStartAndEndSlotByValidatorIndex(validatorIndex)
        } catch (err) {
          console.log('getStartAndEndSlotByValidatorIndex error: ', err)
          throw err
        }

        let sweeps
        try {
          sweeps = await sdk.balanceReport.getDETHSweeps(
            validatorIndex,
            slotIndexes[1],
            slotIndexes[0]
          )
        } catch (err) {
          console.log('getDETHSweeps error: ', err)
          throw err
        }

        if (sweeps) {
          let finalSweep: any
          try {
            finalSweep = await sdk.balanceReport.getFinalSweep(BEACON_NODE_URL, validatorIndex)
          } catch (err) {
            console.log('getFinalSweep error: ', err)
            throw err
          }

          const filteredInsideSweeps = sweeps.sweeps.filter(
            (sweep: any) =>
              sweep.withdrawal_index &&
              Number(sweep.withdrawal_index) !== Number(finalSweep.sweep.index)
          )
          sweeps = { sweeps: filteredInsideSweeps }

          let unreportedSweeps = await sdk.withdrawal.filterUnreportedSweepReports(sweeps.sweeps)
          sweeps = { sweeps: unreportedSweeps }

          const sumOfSweeps = sdk.balanceReport.calculateSumOfSweeps(sweeps.sweeps)

          let listOfUnverifiedReports = []
          try {
            const { stakeHouse } = stakehouseAccount
            if (!sumOfSweeps.eq(ethers.BigNumber.from('0'))) {
              const verifyAndReport = await sdk.withdrawal.verifyAndReportAllSweepsAtOnce(
                stakeHouse,
                totalETHSentToBLSPublicKey.toString(),
                sweeps.sweeps,
                finalisedReport,
                true
              )

              if (!isGnosis) notifyHash(verifyAndReport.tx.hash)
              await verifyAndReport.tx.wait(3)

              listOfUnverifiedReports = verifyAndReport.listOfUnverifiedReports
            }
          } catch (err) {
            console.log('verifyAndReportAllSweepsAtOnce err: ', err)
            throw err
          }

          const sumOfUnVerifiedReports =
            sdk.balanceReport.calculateSumOfSweeps(listOfUnverifiedReports)

          let finalReport
          try {
            finalReport = await sdk.balanceReport.generateFinalReport(
              BEACON_NODE_URL,
              blsKey,
              totalETHSentToBLSPublicKey,
              sumOfUnVerifiedReports,
              listOfUnverifiedReports,
              finalSweep
            )
            finalReport.blsPublicKey = sdk.utils.remove0x(finalReport.blsPublicKey)
            finalReport.totalETHSentToBLSKey = totalETHSentToBLSPublicKey.toString()
            finalReport.sumOfUnreportedSweeps = sumOfUnVerifiedReports.toString()
          } catch (err) {
            console.log('generateFinalReport and formatSweepReport error: ', err)
            throw err
          }

          let verifyFinalReport
          try {
            verifyFinalReport = await sdk.balanceReport.verifyFinalReport(
              finalReport.unreportedSweeps.sweeps,
              finalReport
            )
          } catch (err) {
            console.log('verifyFinalReport error: ', err)
            throw err
          }

          let rageQuitAssistantAddress
          try {
            const feesAndMevPool = lsdvalidator.smartWallet.liquidStakingNetwork.feesAndMevPool
            rageQuitAssistantAddress = await sdk.wizard.getRageQuitAssistantForBLSPublicKey(
              feesAndMevPool,
              blsKey
            )
          } catch (err) {
            console.log('getRageQuitAssistantForBLSPublicKey error: ', err)
            throw err
          }
          finalReport.unreportedSweeps = await sdk.balanceReport.formatSweepReport(
            listOfUnverifiedReports,
            validatorIndex
          )

          try {
            const fullWithdrawalTx = await sdk.wizard.executeFullWithdrawalInRageQuitAssistant(
              rageQuitAssistantAddress,
              totalETHSentToBLSPublicKey,
              finalReport.unreportedSweeps,
              verifyFinalReport
            )
            if (!isGnosis) notifyHash(fullWithdrawalTx.hash)
            await fullWithdrawalTx.wait()
            setTxHash(fullWithdrawalTx.hash)
          } catch (err) {
            console.log('executeFullWithdrawalInRageQuitAssistant error: ', err)
            throw err
          }
        } else {
          setError(handleErr(undefined, 'sweeps is null.'))
        }
      } catch (err) {
        setError(handleErr(err, 'Something went wrong.'))
      }
      setLoading(false)
    }
  }, [sdk, blsKey, lsdvalidator, stakehouseAccount])

  return {
    handleBorrowDETH,
    handleTopUpDETH,
    handleDeployAssistant,
    handleUnstakeETH,
    handleWithdrawValidator,
    setEligible,
    setError,
    setWaitUnstakeModal,
    setFetchAuthenticatedReportError,
    fetchAuthenticatedReport,
    setUnstakable,
    setTopUpRequired,
    handleTopUpSlashedSlot,
    isUnstakable,
    currentStep,
    error,
    fetchAuthenticatedReportError,
    isLoading,
    firstLoading,
    txHash,
    eligible,
    requiredDETH,
    waitUnstakeModal,
    topUpRequired,
    loadingTopup
  }
}
