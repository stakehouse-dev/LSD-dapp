import { useMemo } from 'react'

import useProtectedBatchQuery from './queries/useProtectedBatchQuery'

export const usePortfolioProtectedBatch = () => {
  const protectedBatch = useProtectedBatchQuery()

  const data = useMemo(() => {
    const {
      dETHEarned = 0,
      validators = {},
      slippage = 0,
      nav = 0,
      epoch_apr,
      validator_earnings = {},
      validator_indexes = {},
      dETHEarnings = {}
    } = protectedBatch.data || {}
    const numberOfKnots = Object.keys(validators).length

    return {
      totaldETHEarned: dETHEarned,
      epoch_apr,
      knotIds: Object.keys(validators),
      numberOfKnots,
      slippage,
      validators,
      validator_indexes,
      validator_earnings,
      dETHEarnings,
      nav,
      loading: protectedBatch.isLoading
    } as any
  }, [protectedBatch.data])

  return data
}
