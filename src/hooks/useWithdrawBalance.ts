import { useQuery } from '@apollo/client'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useSigner } from 'wagmi'

import { WITHDRAW_MODE } from '@/constants'
import {
  FeesMevPoolsBalanceQuery,
  FeesMevWithdrawBalanceQuery,
  ProtectedPoolsBalanceQuery,
  ProtectedWithdrawBalanceQuery
} from '@/graphql/queries/WithdrawBalanceQuery'
import { calcBalance, calcPoolBalance } from '@/utils/calcBalance'

import { GiantFeesAndMevPoolsQuery } from '../graphql/queries/GiantFeesAndMevPoolsQuery'
import { GiantSavETHPoolQuery } from '../graphql/queries/GiantSavETHPoolQuery'
import { useCustomAccount, useLsdValidators, useSDK } from '.'

export type ILSDNetworkOption = Record<
  string,
  {
    ticker: string
    balance: number
    savETHPool?: string
    feesAndMevPool?: string
    blsKeys?: string[]
    rawBalance?: string
    ethBalance?: string
    dethBalance?: string
  }
>

export type IBlsKeyOption = {
  blsKey: string
  balance: number
  lpToken: string
  rawBalance: string
  ethBalance?: string
  dethBalance?: string
}

export const useWithdrawBalance = (isNodeRunner: boolean, mode?: WITHDRAW_MODE) => {
  const { sdk } = useSDK()
  const { data: signer } = useSigner()
  const { account } = useCustomAccount()

  const address = account?.address

  const [balance, setBalance] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefetch, setIsRefetch] = useState<boolean>(false)
  const [isEligible, setEligible] = useState(true)
  const [lastInteractedTimestamp, setLastInteractedTimestamp] = useState<number>(0)
  const [rageQuitValidators, setRageQuitValidators] = useState<any>()
  const [rageQuitLSDs, setRageQuitLSDs] = useState<any>()

  const { data: giantSavETHData } = useQuery(GiantSavETHPoolQuery)
  const { data: giantFeesAndMEVData } = useQuery(GiantFeesAndMevPoolsQuery)

  const { count, loading: validatorLoading } = useLsdValidators(address ?? '')

  const { data: { protectedBatches } = {} } = useQuery(ProtectedWithdrawBalanceQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address,
    fetchPolicy: 'network-only'
  })

  const { data: { lptokens: protectedLPs } = {} } = useQuery(ProtectedPoolsBalanceQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address,
    fetchPolicy: 'network-only'
  })

  const { data: { feesAndMevBatches } = {} } = useQuery(FeesMevWithdrawBalanceQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address,
    fetchPolicy: 'network-only'
  })

  const { data: { lptokens: feesAndMevLPs } = {} } = useQuery(FeesMevPoolsBalanceQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address,
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    const getRageQuitV2 = async () => {
      setLoading(true)
      const rqValidators: any = {},
        LSDs: any = {}
      try {
        const data = await sdk?.wizard.getClaimableUnstakedETH(address)
        if (!data) {
          setRageQuitLSDs({})
          setRageQuitValidators({})
          setLoading(false)
          return
        }

        data.map((item: any) => {
          if (Number(formatEther(item.preview)) < 0.000000001) return

          if (item.lsd in LSDs) {
            const oldItem = LSDs[item.lsd]
            LSDs[item.lsd] = {
              ...oldItem,
              balance: oldItem.balance + Number(formatEther(item.preview))
            }
          } else
            LSDs[item.lsd] = {
              ticker: item.ticker,
              balance: Number(formatEther(item.preview))
            }

          if (item.blsPublicKey in rqValidators) {
            const oldItem = rqValidators[item.blsPublicKey]

            rqValidators[item.blsPublicKey] = {
              ...oldItem,
              deposits: [...oldItem.deposits, item],
              balance: oldItem.balance + Number(formatEther(item.preview))
            }
          } else
            rqValidators[item.blsPublicKey] = {
              deposits: [item],
              blsKey: item.blsPublicKey,
              balance: Number(formatEther(item.preview)),
              lsdId: item.lsd
            }
        })

        const validators: any = {}
        Object.keys(rqValidators).map((key: string) => {
          const item = rqValidators[key]

          if (item.lsdId in validators) validators[item.lsdId] = [...validators[item.lsdId], item]
          else validators[item.lsdId] = [item]
        })

        setRageQuitValidators(validators)
        setRageQuitLSDs(LSDs)
      } catch (error) {
        setRageQuitLSDs({})
        setRageQuitValidators({})
        console.log('---- getClaimableUnstakedETH -----', error)
      }

      setLoading(false)
    }

    getRageQuitV2()
  }, [sdk, address, isNodeRunner])

  const protectedBlsKeys = useMemo(() => {
    const blsKeys: Record<string, IBlsKeyOption[]> = {}
    if (protectedLPs && protectedLPs.length > 0) {
      protectedLPs.map((item: any) => {
        if (item.liquidStakingNetwork.id in blsKeys) {
          blsKeys[item.liquidStakingNetwork.id] = [
            ...blsKeys[item.liquidStakingNetwork.id],
            {
              blsKey: item.blsPublicKey,
              balance: Number(formatEther(item.liquidityProviders[0].amount)),
              rawBalance: formatEther(item.liquidityProviders[0].amount),
              lpToken: item.id
            }
          ]
        } else
          blsKeys[item.liquidStakingNetwork.id] = [
            {
              blsKey: item.blsPublicKey,
              balance: Number(formatEther(item.liquidityProviders[0].amount)),
              rawBalance: formatEther(item.liquidityProviders[0].amount),
              lpToken: item.id
            }
          ]
      })
    }

    return blsKeys
  }, [protectedLPs])

  const feesAndMevBlsKeys = useMemo(() => {
    const blsKeys: Record<string, IBlsKeyOption[]> = {}
    if (feesAndMevLPs && feesAndMevLPs.length > 0) {
      feesAndMevLPs.map((item: any) => {
        if (item.liquidStakingNetwork.id in blsKeys) {
          blsKeys[item.liquidStakingNetwork.id] = [
            ...blsKeys[item.liquidStakingNetwork.id],
            {
              blsKey: item.blsPublicKey,
              balance: Number(formatEther(item.liquidityProviders[0].amount)),
              rawBalance: formatEther(item.liquidityProviders[0].amount),
              lpToken: item.id
            }
          ]
        } else
          blsKeys[item.liquidStakingNetwork.id] = [
            {
              blsKey: item.blsPublicKey,
              balance: Number(formatEther(item.liquidityProviders[0].amount)),
              rawBalance: formatEther(item.liquidityProviders[0].amount),
              lpToken: item.id
            }
          ]
      })
    }

    return blsKeys
  }, [feesAndMevLPs])

  const protectedLSDs = useMemo(() => {
    let giantBalance = 0
    if (protectedBatches) {
      const batches = protectedBatches.filter((item: any) => item.vaultLPToken === null)
      giantBalance = calcBalance(batches)
    }

    const networks: ILSDNetworkOption = {
      giant_pool: { ticker: 'Giant Pool', balance: giantBalance }
    }

    if (protectedLPs && protectedLPs.length > 0) {
      protectedLPs.map((item: any) => {
        if (item.liquidStakingNetwork.id in networks) {
          networks[item.liquidStakingNetwork.id].balance += Number(
            formatEther(item.liquidityProviders[0].amount)
          )
        } else
          networks[item.liquidStakingNetwork.id] = {
            ticker: item.liquidStakingNetwork.ticker,
            savETHPool: item.liquidStakingNetwork.savETHPool,
            feesAndMevPool: item.liquidStakingNetwork.feesAndMevPool,
            balance: Number(formatEther(item.liquidityProviders[0].amount))
          }
      })
    }

    return networks
  }, [protectedLPs, protectedBatches])

  const feesAndMevLSDs = useMemo(() => {
    let giantBalance = 0
    if (feesAndMevBatches) {
      const batches = feesAndMevBatches.filter((item: any) => item.vaultLPToken === null)
      giantBalance = calcBalance(batches)
    }

    const networks: ILSDNetworkOption = {
      giant_pool: { ticker: 'Giant Pool', balance: giantBalance }
    }
    if (feesAndMevLPs && feesAndMevLPs.length > 0) {
      feesAndMevLPs.map((item: any) => {
        if (item.liquidStakingNetwork.id in networks) {
          networks[item.liquidStakingNetwork.id].balance += Number(
            formatEther(item.liquidityProviders[0].amount)
          )
        } else
          networks[item.liquidStakingNetwork.id] = {
            ticker: item.liquidStakingNetwork.ticker,
            savETHPool: item.liquidStakingNetwork.savETHPool,
            feesAndMevPool: item.liquidStakingNetwork.feesAndMevPool,
            balance: Number(formatEther(item.liquidityProviders[0].amount))
          }
      })
    }

    return networks
  }, [feesAndMevLPs, feesAndMevBatches])

  const checkGiantLPTokenIfEligible = async (mode: WITHDRAW_MODE) => {
    if (signer) {
      const giantLPToken =
        mode === WITHDRAW_MODE.STAKING
          ? giantSavETHData.giantSavETHPools[0]?.giantLPToken
          : giantFeesAndMEVData.giantFeesAndMevPools[0]?.giantLPToken
      const timestamp = await sdk?.wizard.getLastInteractedTimestamp(address, giantLPToken)

      setLastInteractedTimestamp(timestamp)
      const isEligible = await sdk?.wizard.isEligibleToInteractWithGiantLPToken(timestamp)

      return isEligible
    }
  }

  const checkLPTokenIfEligible = async (lpToken: string) => {
    if (signer) {
      const timestamp = await sdk?.wizard.getLastInteractedTimestampForLPToken(address, lpToken)

      setLastInteractedTimestamp(timestamp)
      const isEligible = await sdk?.wizard.isEligibleToInteractWithLPToken(timestamp)

      return isEligible
    }

    return true
  }

  useEffect(() => {
    const initBalance = async () => {
      let stakingBalance,
        feesMevBalance,
        nodeOperatorBalance,
        unstakedBalance = 0,
        totalBalance,
        batches

      switch (mode) {
        case WITHDRAW_MODE.STAKING:
          if (protectedBatches) {
            batches = protectedBatches.filter((item: any) => item.vaultLPToken === null)

            let lpBalance = 0
            if (protectedLPs && protectedLPs.length > 0) {
              lpBalance = calcPoolBalance(protectedLPs)
            }

            setBalance(Number(calcBalance(batches) + lpBalance).toFixed(2))
          } else setBalance('0')
          break

        case WITHDRAW_MODE.FEES_MEV:
          if (feesAndMevBatches) {
            batches = feesAndMevBatches.filter((item: any) => item.vaultLPToken === null)

            let lpBalance = 0
            if (feesAndMevLPs && feesAndMevLPs.length > 0) {
              lpBalance = calcPoolBalance(feesAndMevLPs)
            }

            setBalance(Number(calcBalance(batches) + lpBalance).toFixed(2))
          } else setBalance('0')

          break

        case WITHDRAW_MODE.NODE_OPERATOR:
          nodeOperatorBalance = parseEther(Number(count * 4).toFixed(2))
          setBalance(formatEther(nodeOperatorBalance))
          break

        case WITHDRAW_MODE.UNSTAKED_VALIDATOR:
          Object.keys(rageQuitLSDs).map((id) => (unstakedBalance += rageQuitLSDs[id].balance))

          setBalance(
            Number(unstakedBalance).toLocaleString(undefined, { maximumFractionDigits: 3 })
          )
          break

        default:
          if (protectedBatches) {
            batches = protectedBatches.filter((item: any) => item.vaultLPToken === null)

            let lpBalance = 0
            if (protectedLPs && protectedLPs.length > 0) {
              lpBalance = calcPoolBalance(protectedLPs)
            }

            stakingBalance = calcBalance(batches) + lpBalance
          } else stakingBalance = 0

          if (feesAndMevBatches) {
            batches = feesAndMevBatches.filter((item: any) => item.vaultLPToken === null)

            let lpBalance = 0
            if (feesAndMevLPs && feesAndMevLPs.length > 0) {
              lpBalance = calcPoolBalance(feesAndMevLPs)
            }

            feesMevBalance = calcBalance(batches) + lpBalance
          } else feesMevBalance = 0

          nodeOperatorBalance = Number(count * 4)
          totalBalance = stakingBalance + feesMevBalance + nodeOperatorBalance

          setBalance(Number(totalBalance).toFixed(2))
          break
      }
    }

    if (
      sdk &&
      address &&
      !validatorLoading &&
      protectedBatches &&
      feesAndMevBatches &&
      rageQuitLSDs
    )
      initBalance()
  }, [
    sdk,
    validatorLoading,
    isRefetch,
    protectedBatches,
    feesAndMevBatches,
    protectedLPs,
    feesAndMevLPs,
    rageQuitLSDs
  ])

  const refetch = () => setIsRefetch(!isRefetch)

  return {
    balance,
    loading: validatorLoading || loading,
    isEligible,
    lastInteractedTimestamp,
    refetch,
    checkLPTokenIfEligible,
    checkGiantLPTokenIfEligible,
    LSDs:
      mode === WITHDRAW_MODE.STAKING
        ? protectedLSDs
        : mode === WITHDRAW_MODE.FEES_MEV
        ? feesAndMevLSDs
        : mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR
        ? rageQuitLSDs
        : null,
    blsKeys:
      mode === WITHDRAW_MODE.STAKING
        ? protectedBlsKeys
        : mode === WITHDRAW_MODE.FEES_MEV
        ? feesAndMevBlsKeys
        : mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR
        ? rageQuitValidators
        : null
  }
}
