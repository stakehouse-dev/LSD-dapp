import { useMemo } from 'react'

import useFeesMevQuery from './queries/useFeesMevQuery'

export const usePortfolioFeesMev = () => {
  const feesMev = useFeesMevQuery()

  const data = useMemo(() => {
    const {
      validators = {},
      payouts = 0,
      indexes = 0,
      redemption_rate = {},
      validator_indexes = {},
      validator_slot = {},
      sETH = {}
    } = feesMev.data || {}
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
      loading: feesMev.isLoading
    } as any
  }, [feesMev.data])

  return data
}
