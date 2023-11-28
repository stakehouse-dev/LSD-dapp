import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { FEE_API_ENDPOINT } from '@/constants'

export type LSDComplianceScoreFetcherData = {
  compliance_score: number
}

export async function LSDComplianceScoreFetcher(liquidStakingManager: string) {
  const data = await fetch(
    `${FEE_API_ENDPOINT}/monitoring/lsd_fee_recipient/health?lsd_id=${liquidStakingManager}`
  ).then((response) => response.json() as Promise<LSDComplianceScoreFetcherData>)

  return data ?? null
}

export default function useLSDComplianceScoreQuery(
  liquidStakingManager: string,
  options?: UseQueryOptions<LSDComplianceScoreFetcherData>
) {
  return useQuery<LSDComplianceScoreFetcherData>(
    ['LSDComplianceScore', liquidStakingManager],
    () => LSDComplianceScoreFetcher(liquidStakingManager),
    {
      enabled: liquidStakingManager !== undefined,
      ...options
    }
  )
}
