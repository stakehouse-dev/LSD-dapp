import { ethers } from 'ethers'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useBalance } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-blue-eth.svg'
import DETHIcon from '@/assets/images/icon-deth.svg'
import { ModalRedeemETH, ModalReportBalanceForRedeem } from '@/components/app'
import {
  Button,
  CompletedTxView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner,
  TextInput
} from '@/components/shared'
import { config } from '@/constants/environment'
import { useCustomAccount, useMakeRealTxHash, useNetworkBasedLinkFactories, useSDK } from '@/hooks'
import { useTotalAvailableETH } from '@/hooks'
import { EligibleValidator, FinalizedReport } from '@/types'
import { bigToNum, humanReadableAddress, notifyHash, noty, roundNumber } from '@/utils/global'

export const Redeem = () => {
  const navigate = useNavigate()
  const { account, isGnosis } = useCustomAccount()
  const { sdk } = useSDK()
  const { fetchTotalAvailableETH, validatorsForReporting } = useTotalAvailableETH()
  const { data: { formatted: availableAmount } = {}, refetch } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    token: config.dethTokenAddress as `0x${string}`,
    chainId: config.networkId
  })

  const [availableDETHAmount, setAvailableDETHAmount] = useState(0)
  const [openReportBalanceModal, setOpenReportBalanceModal] = useState(false)
  const [dETHAmount, setDETHAmount] = useState('0')
  const [ethAmount, setETHAmount] = useState('0')
  const [validators, setValidators] = useState<EligibleValidator[]>([])
  const [finalisedReportsForPartialWithdrawal, setFinalisedReportsForPartialWithdrawal] = useState<
    FinalizedReport[]
  >([])
  const [unwrapAmounts, setUnwrapAmounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [redeemError, setRedeemError] = useState('')
  const [txResult, setTxResult] = useState<any>()
  const [openRedeemETHModal, setOpenRedeemETHModal] = useState(false)
  const [openPreReportBalanceModal, setOpenPreReportBalanceModal] = useState(false)

  const { hash } = useMakeRealTxHash(txResult?.hash)
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  const initialFetch = useCallback(
    (refetching: boolean = false) => {
      if (availableAmount) {
        fetchTotalAvailableETH(availableAmount)
          .then((result) => {
            if (result) {
              const { totalAvailableETH } = result
              setDETHAmount(`${ethers.utils.formatEther(totalAvailableETH).toString()}`)
              setAvailableDETHAmount(bigToNum(totalAvailableETH))
            } else {
              setValidators([])
              if (refetching) {
                noty('No ETH found to redeem. Please try again later.')
              }
            }
          })
          .catch((err) => {
            setInitialLoading(false)
            console.log('availableAmount error: ', err)
            if (refetching) {
              noty('Balance reporting failed.')
            }
          })
      }
    },
    [availableAmount, fetchTotalAvailableETH]
  )

  useEffect(() => {
    initialFetch()
  }, [initialFetch])

  useEffect(() => {
    setInitialLoading(true)
    if (Number(dETHAmount) > 0 && Number(dETHAmount) <= Number(availableDETHAmount)) {
      fetchTotalAvailableETH(dETHAmount)
        .then((result) => {
          if (result) {
            const {
              totalAvailableETH,
              validatorsInOpenIndex,
              finalisedReportsForPartialWithdrawal,
              unwrapAmounts
            } = result
            setETHAmount(ethers.utils.formatEther(totalAvailableETH).toString())
            setValidators(validatorsInOpenIndex)
            setFinalisedReportsForPartialWithdrawal(finalisedReportsForPartialWithdrawal)
            setUnwrapAmounts(unwrapAmounts)
          } else {
            setValidators([])
          }
          setInitialLoading(false)
        })
        .catch((err) => {
          setInitialLoading(false)
          console.log('availableAmount error: ', err)
        })
    } else {
      setInitialLoading(false)
    }
  }, [dETHAmount, availableDETHAmount, fetchTotalAvailableETH])

  const handleChangeBurnAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    if (value === '.') {
      setDETHAmount('0.')
    } else if (!isNaN(Number(value))) {
      setDETHAmount(value)
    }
  }

  const handleRedeem = async (afterReportedBalance?: boolean) => {
    if (sdk) {
      if (!afterReportedBalance) {
        return setOpenReportBalanceModal(true)
      }

      setLoading(true)
      try {
        const blsKeysForPartialWithdrawal = finalisedReportsForPartialWithdrawal.map(
          (report: any) => report.blsPublicKey
        )
        const tx = await sdk.withdrawal.batchUnwrapDETH(blsKeysForPartialWithdrawal, unwrapAmounts)

        if (!isGnosis) notifyHash(tx.hash)
        await tx.wait()
        setTxResult(tx)
      } catch (err) {
        console.log('batchUnwrapDETH error: ', err)
      }
    }
    setLoading(false)
  }

  const onBack = () => {
    navigate('/')
  }

  const handleCloseReportBalanceModal = () => {
    setOpenReportBalanceModal(false)
  }
  const handleSubmittedReportBalance = () => {
    setOpenReportBalanceModal(false)
    handleRedeem(true)
  }
  const handleClosePreReportBalanceModal = () => {
    setOpenPreReportBalanceModal(false)
  }
  const handleSubmittedPreReportBalance = () => {
    setOpenPreReportBalanceModal(false)
    initialFetch(true)
  }

  return (
    <div className="text-white py-10 flex flex-col mx-auto flex-1">
      <div className="w-full text-center text-32 font-semibold flex items-center gap-4 justify-center">
        <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={onBack} />
        Redeem dETH to ETH
      </div>
      <div className="p-4 rounded-lg w-full mt-10 bg-grey850 relative">
        <div className="p-2 flex flex-col">
          <p className="text-white text-base font-semibold pl-2">Burn</p>
          <TextInput
            className="bg-grey900 px-4 py-3 pr-28 w-full rounded-lg border border-innerBorder outline-none text-32"
            placeholder=""
            value={dETHAmount}
            onChange={handleChangeBurnAmount}
          />
          <div className="absolute right-8 top-14 flex flex-col gap-1 mt-1">
            <div className="rounded-full p-1 pr-2 bg-opacity-10 bg-white flex items-center gap-2">
              <img src={DETHIcon} alt="token_icon" className="w-6" />
              <p className="text-textBase text-xl font-medium leading-5">dETH</p>
            </div>
            <p className="text-sm text-grey600 ml-1">
              Balance: {availableAmount ? roundNumber(Number(availableAmount), 3) : '0.0'}
            </p>
          </div>
          {Number(dETHAmount) > Number(availableDETHAmount) && (
            <p className="text-xs text-error mt-1">
              Please make sure the amount is not more than existing dETH balance.
            </p>
          )}
        </div>
        <div className="p-2 flex flex-col">
          <p className="text-grey600 text-base pl-2">Get</p>
          <TextInput
            disabled
            className="bg-grey850 px-4 rounded-lg border border-innerBorder outline-none text-32"
            placeholder=""
            value={ethAmount}
          />
        </div>
        <div className="p-2 w-full flex flex-col gap-4">
          <Button
            className="w-full"
            disabled={Number(dETHAmount) === 0 || Number(dETHAmount) > Number(availableDETHAmount)}
            onClick={() => handleRedeem(false)}
            size="lg">
            {initialLoading ? (
              <div className="flex justify-center">
                <Spinner size={24} />
              </div>
            ) : (
              'Redeem'
            )}
          </Button>
          <div className="text-sm font-medium text-grey300 flex gap-2">
            {validators && validators.length > 0 ? (
              <>
                Redeeming through validator{' '}
                {humanReadableAddress(`0x${validators[0].beaconReport.blsPublicKey}`)}
                <a
                  className="text-primary flex items-center gap-1"
                  onClick={() => setOpenRedeemETHModal(true)}>
                  Learn More <ArrowTopRightIcon />
                </a>
              </>
            ) : (
              <>
                No ETH available currently. Try{' '}
                <a
                  className="text-primary flex items-center gap-1"
                  onClick={() => setOpenPreReportBalanceModal(true)}>
                  Balance Reporting
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <CTA onClick={() => navigate('/manage/facilitator')}>
        <EthIcon />
        Unlock More ETH Instantly with Our New Validator Queue! <ArrowTopRightIcon />
      </CTA>
      <ModalRedeemETH
        open={openRedeemETHModal}
        validators={validators}
        onClose={() => setOpenRedeemETHModal(false)}
      />
      <LoadingModal open={loading} onClose={() => {}} title="Confirmation Pending" />
      <ErrorModal
        open={!!redeemError}
        onClose={() => setRedeemError('')}
        title="Something went wrong"
        message={redeemError}
        actionButtonContent="Try Again"
        onAction={() => setRedeemError('')}
      />
      <ModalDialog open={!!txResult} onClose={() => setTxResult(undefined)}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLink={makeEtherscanLink(hash)}
          onGoToClick={() => navigate('/')}
          message={
            <span className="text-sm text-grey300">{`Redeemed ${ethAmount} ETH successfully`}</span>
          }
        />
      </ModalDialog>
      <ModalReportBalanceForRedeem
        open={openReportBalanceModal}
        validators={validators}
        dETHAmount={dETHAmount}
        onClose={handleCloseReportBalanceModal}
        onSubmitted={handleSubmittedReportBalance}
      />
      <ModalReportBalanceForRedeem
        open={openPreReportBalanceModal}
        validators={validatorsForReporting}
        dETHAmount={'0'}
        onClose={handleClosePreReportBalanceModal}
        onSubmitted={handleSubmittedPreReportBalance}
      />
    </div>
  )
}
const CTA = styled.div`
  ${tw`mt-6 py-4 px-6 bg-primary100 rounded-lg text-primary flex gap-2 items-center cursor-pointer`}
  box-shadow: 0px 0px 10px 0px #00ed76;
`
