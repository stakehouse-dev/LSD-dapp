import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { API_ENDPOINT } from '@/constants'

import { useCustomAccount } from '../useCustomAccount'

export type NodeOperatorFetcherData = {
  indexes: number
  payouts: number
  validators: Record<string, number[]>
  validator_indexes: Record<string, number>
  redemption_rate: Record<string, number>
  validator_slot: Record<string, number>
  sETH: Record<string, number>
}

export async function nodeOperatorFetcher(account: string) {
  const data = await fetch(`${API_ENDPOINT}/userIncome/runner?user=${account}`).then(
    (response) => response.json() as Promise<NodeOperatorFetcherData>
  )

  return data ?? null
}

export default function useNodeOperatorQuery(options?: UseQueryOptions<NodeOperatorFetcherData>) {
  const { account } = useCustomAccount()
  const address = account?.address

  return useQuery<NodeOperatorFetcherData>(
    ['portfolioNodeOperator', address],
    () => nodeOperatorFetcher(address?.toLowerCase() || ''),

    {
      enabled: address !== undefined,
      ...options
    }
  )
}
