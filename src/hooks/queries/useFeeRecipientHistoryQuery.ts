import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { FEE_API_ENDPOINT } from '@/constants'

export type FeeRecipientHistoryFetcherData = {
  slot: number
  compliant: boolean
  validator_pubkey: string
  lsd_id: string
  fee_recipient: string
  lsd_fee_recipient: string
}

export async function feeRecipientHistoryFetcher(liquidStakingManager: string) {
  const data = await fetch(
    `${FEE_API_ENDPOINT}/monitoring/lsd_fee_recipient/history?lsd_id=${liquidStakingManager}`
  ).then((response) => response.json() as Promise<FeeRecipientHistoryFetcherData[]>)

  return data ?? null
}

export default function useFeeRecipientHistoryQuery(
  liquidStakingManager: string,
  options?: UseQueryOptions<FeeRecipientHistoryFetcherData[]>
) {
  return useQuery<FeeRecipientHistoryFetcherData[]>(
    ['feeRecipientHistory', liquidStakingManager],
    () => feeRecipientHistoryFetcher(liquidStakingManager),
    {
      enabled: liquidStakingManager !== undefined,
      ...options
    }
  )
}
