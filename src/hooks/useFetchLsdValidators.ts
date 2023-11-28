import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { AllNodeRunnersQuery } from '@/graphql/queries/NodeRunnersQuery'
import { TLSDNetwork, TLSDValidator } from '@/types'

import { useCustomAccount } from './useCustomAccount'

export const useFetchLsdValidators = () => {
  const [validators, setValidators] = useState<TLSDValidator[]>([])
  const [networks, setNetworks] = useState<TLSDNetwork[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { account } = useCustomAccount()
  const address = account?.address

  const {
    data: nodeRunners,
    refetch: refetchNodeRunners,
    loading
  } = useQuery(AllNodeRunnersQuery, {
    variables: {
      address: address?.toLowerCase()
    },
    skip: !address,
    fetchPolicy: 'network-only'
  })

  const handleRefresh = () => {
    refetchNodeRunners()
  }

  useEffect(() => {
    if (!loading && nodeRunners) {
      setIsLoading(true)
      if (nodeRunners && nodeRunners.nodeRunners[0]) {
        setValidators(nodeRunners.nodeRunners[0].validators)
        setNetworks(nodeRunners.nodeRunners[0].liquidStakingNetworks)
      } else {
        setValidators([])
      }
      setIsLoading(false)
    }
  }, [nodeRunners, loading])

  return {
    validators,
    networks,
    handleRefresh,
    isLoading: isLoading || loading
  }
}
