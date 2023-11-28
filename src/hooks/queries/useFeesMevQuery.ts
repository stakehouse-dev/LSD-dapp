import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/constants'

import { useCustomAccount } from '../useCustomAccount'

export type FeesMevFetcherData = {
  indexes: number
  payouts: number
  validators: Record<string, number[]>
  validator_indexes: Record<string, number>
  redemption_rate: Record<string, number>
  validator_slot: Record<string, number>
  sETH: Record<string, number>
}

export async function feesMevFetcher(account: string) {
  const data = await fetch(`${API_ENDPOINT}/userIncome/mev_fees?user=${account}`).then(
    (response) => response.json() as Promise<FeesMevFetcherData>
  )

  return data ?? null
}

export default function useFeesMevQuery(options?: UseQueryOptions<FeesMevFetcherData>) {
  const { account } = useCustomAccount()
  const address = account?.address

  return useQuery<FeesMevFetcherData>(
    ['portfolioFeesMev', address],
    () => feesMevFetcher(address?.toLowerCase() || ''),
    {
      enabled: address !== undefined,
      ...options
    }
  )
}
