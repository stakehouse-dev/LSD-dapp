import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/constants'

import { useCustomAccount } from '../useCustomAccount'

export type ProtectedBatchFetcherData = {
  epoch_apr: Record<string, number>
  dETHEarned: number
  validators: Record<string, number[]>
  slippage: number
  nav: number
  validator_indexes: Record<string, number>
  validator_earnings: Record<string, number[]>
  dETHEarnings: Record<string, number[]>
}

export async function protectedBatchFetcher(account: string) {
  const data = await fetch(
    `${API_ENDPOINT}/userIncome/protected_batch?user=${account}&epochs=1575`
  ).then((response) => response.json() as Promise<ProtectedBatchFetcherData>)

  return data ?? null
}

export default function useProtectedBatchQuery(
  options?: UseQueryOptions<ProtectedBatchFetcherData>
) {
  const { account } = useCustomAccount()
  const address = account?.address

  return useQuery<ProtectedBatchFetcherData>(
    ['portfolioProtectedBatch', address],
    () => protectedBatchFetcher(address?.toLowerCase() || ''),
    {
      enabled: address !== null,
      ...options
    }
  )
}
