import { useQuery } from '@apollo/client'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { GiantFeesAndMevPoolsQuery } from '@/graphql/queries/GiantFeesAndMevPoolsQuery'
import { GiantSavETHPoolQuery } from '@/graphql/queries/GiantSavETHPoolQuery'

import { NodeRunnersQuery } from '../graphql/queries/NodeRunnersQuery'
import { useCustomAccount } from './useCustomAccount'

export const useAvailableToStake = (from: 'Node Runner' | 'Staking' | 'FeesMev' | 'Main') => {
  const [amount, setAmount] = useState(0)

  const { account } = useCustomAccount()
  const address = account?.address

  const { data: giantSavETHData, refetch: refetchGiantSavETHData } = useQuery(GiantSavETHPoolQuery)
  const { data: giantFeesAndMevData, refetch: refetchGiantFeesAndMevData } =
    useQuery(GiantFeesAndMevPoolsQuery)
  const { data: nodeRunnersData, refetch: refetchNodeRunnerData } = useQuery(NodeRunnersQuery, {
    variables: { address: address?.toLowerCase(), status: 'READY_TO_STAKE' }
  })

  const fetchData = useCallback(() => {
    if (giantFeesAndMevData && giantSavETHData && nodeRunnersData) {
      const giantFeesAndMevAmount = giantFeesAndMevData.giantFeesAndMevPools[0]?.availableToStake
      const giantSavETHAmount = giantSavETHData.giantSavETHPools[0]?.availableToStake
      if (from === 'Main') {
        const result =
          Number(ethers.utils.formatEther(ethers.BigNumber.from(giantFeesAndMevAmount ?? 0))) +
          Number(ethers.utils.formatEther(ethers.BigNumber.from(giantSavETHAmount ?? 0)))
        setAmount(result)
      } else if (from === 'Staking') {
        const result = Number(
          ethers.utils.formatEther(ethers.BigNumber.from(giantSavETHAmount ?? 0))
        )
        setAmount(result)
      } else if (from === 'Node Runner') {
        const validators = nodeRunnersData.nodeRunners[0]?.validators
        if (validators && validators.length > 0) {
          setAmount(validators.length * 4)
        } else {
          setAmount(0)
        }
      } else {
        const result = Number(
          ethers.utils.formatEther(ethers.BigNumber.from(giantFeesAndMevAmount ?? 0))
        )
        setAmount(result)
      }
    }
  }, [giantSavETHData, giantFeesAndMevData, nodeRunnersData, from])

  const refetch = () => {
    refetchGiantSavETHData()
    refetchGiantFeesAndMevData()
    refetchNodeRunnerData()
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { amount, refetch: refetch }
}
