import { useMemo } from 'react'

import useNodeOperatorQuery from './queries/useNodeOperatorQuery'

export const usePortfolioNodeOperator = () => {
  const nodeOperator = useNodeOperatorQuery()

  const data = useMemo(() => {
    const {
      validators = {},
      payouts = 0,
      indexes = 0,
      redemption_rate = {},
      validator_indexes = {},
      validator_slot = {},
      sETH = {}
    } = nodeOperator.data || {}
    const numberOfKnots = Object.keys(validators).length

    return {
      knotIds: Object.keys(validators),
      numberOfKnots,
      numberOflsdNetworks: indexes,
      validators,
      payouts,
      redemption_rate,
      validator_indexes,
      validator_slot,
      sETH,
      loading: nodeOperator.isLoading
    } as any
  }, [nodeOperator.data])

  return data
}
