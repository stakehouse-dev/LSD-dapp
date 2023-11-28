import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { ValidatorsQuery } from '@/graphql/queries/NodeRunners'

import { useLSDNetworkList } from '.'

export const useLsdValidators = (address: string) => {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [lsdNetworkBalance, setLsdNetworkBalance] = useState<any>({})
  const [validators, setValidators] = useState<string[]>([])
  const [isRefetch, setIsRefetch] = useState<boolean>(false)
  const { list } = useLSDNetworkList()

  const {
    data,
    loading: validatorsLoading,
    refetch: refetchValidatorsFromGraph
  } = useQuery(ValidatorsQuery, {
    variables: { account: address.toLowerCase() },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    skip: !address
  })

  useEffect(() => {
    if (!validatorsLoading && data && list) {
      setLoading(true)

      let _lsdNetworkBalance: any = {},
        _validators: string[] = [],
        _count: number = 0

      list.forEach((item) => {
        _lsdNetworkBalance[item.liquidStakingManager] = 0
      })

      if (data.nodeRunners && data.nodeRunners.length > 0) {
        data.nodeRunners[0].validators.forEach((validator: any) => {
          _lsdNetworkBalance[validator.smartWallet.liquidStakingNetwork.id] += 4
        })
        _count = data.nodeRunners[0].validators.length

        data.nodeRunners.map((item: any) =>
          item.validators.map((validator: any) => _validators.push(validator.id))
        )

        setValidators(_validators)
        setLsdNetworkBalance(_lsdNetworkBalance)
        setCount(_count)
      }
      setLoading(false)
    }
  }, [validatorsLoading, data, list, isRefetch])

  const refetch = () => {
    refetchValidatorsFromGraph()
    setIsRefetch(!isRefetch)
  }

  return {
    count,
    validators,
    lsdNetworkBalance,
    loading: loading || validatorsLoading,
    refetch
  }
}
