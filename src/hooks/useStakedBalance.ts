import { useQuery } from '@apollo/client'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

import { WITHDRAW_MODE } from '@/constants'
import {
  FeesMevStakedBalanceQuery,
  ProtectedStakedBalanceQuery
} from '@/graphql/queries/StakedBalanceQuery'
import { calcBalance } from '@/utils/calcBalance'

import { StakedValidatorsQuery } from '../graphql/queries/NodeRunners'
import { useCustomAccount, useSDK } from '.'

export const useStakedBalance = (mode?: WITHDRAW_MODE) => {
  const { sdk } = useSDK()
  const { account } = useCustomAccount()
  const address = account?.address

  const [balance, setBalance] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefetch, setIsRefetch] = useState<boolean>(false)

  const { data: { protectedBatches } = {} } = useQuery(ProtectedStakedBalanceQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address || mode === WITHDRAW_MODE.FEES_MEV || mode === WITHDRAW_MODE.NODE_OPERATOR,
    fetchPolicy: 'network-only'
  })

  const { data: { feesAndMevBatches } = {} } = useQuery(FeesMevStakedBalanceQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address || mode === WITHDRAW_MODE.STAKING || mode === WITHDRAW_MODE.NODE_OPERATOR,
    fetchPolicy: 'network-only'
  })

  const { data } = useQuery(StakedValidatorsQuery, {
    variables: { account: address?.toLowerCase() },
    skip: !address || mode === WITHDRAW_MODE.FEES_MEV || mode === WITHDRAW_MODE.STAKING,
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    const initBalance = async () => {
      setLoading(true)
      let stakingBalance,
        feesMevBalance,
        nodeOperatorBalance,
        totalBalance,
        count = 0

      let amount = 0,
        withdrawn = 0

      switch (mode) {
        case WITHDRAW_MODE.STAKING:
          if (protectedBatches) {
            protectedBatches.map((item: any) => {
              amount += Number(formatEther(item.liquidityProviders[0].amount))
              withdrawn += Number(formatEther(item.liquidityProviders[0].withdrawn))
            })

            stakingBalance = amount - withdrawn
            setBalance(Number(amount - withdrawn).toFixed(2))
          } else setBalance('0')
          break

        case WITHDRAW_MODE.FEES_MEV:
          if (feesAndMevBatches) {
            feesAndMevBatches.map((item: any) => {
              amount += Number(formatEther(item.liquidityProviders[0].amount))
              withdrawn += Number(formatEther(item.liquidityProviders[0].withdrawn))
            })

            stakingBalance = amount - withdrawn

            feesMevBalance = amount - withdrawn
            setBalance(Number(amount - withdrawn).toFixed(2))
          } else setBalance('0')

          break

        case WITHDRAW_MODE.NODE_OPERATOR:
          if (data) {
            count = data.nodeRunners.reduce((prev: number, current: any) => {
              return current.validators.length + prev
            }, 0)

            nodeOperatorBalance = parseEther(Number(count * 4).toFixed(2))
            setBalance(formatEther(nodeOperatorBalance))
          } else setBalance('0')
          break

        default:
          if (protectedBatches) {
            stakingBalance = calcBalance(protectedBatches)
          } else stakingBalance = 0

          if (feesAndMevBatches) {
            feesMevBalance = calcBalance(feesAndMevBatches)
          } else feesMevBalance = 0
          if (data)
            count = data.nodeRunners.reduce((prev: number, current: any) => {
              return current.validators.length + prev
            }, 0)

          nodeOperatorBalance = Number(count * 4)
          totalBalance = stakingBalance + feesMevBalance + nodeOperatorBalance

          setBalance(Number(totalBalance).toFixed(2))
          break
      }

      setLoading(false)
    }

    if (sdk && address) initBalance()
  }, [sdk, isRefetch, protectedBatches, feesAndMevBatches, data])

  const refetch = () => setIsRefetch(!isRefetch)
  return { balance, loading, refetch }
}
