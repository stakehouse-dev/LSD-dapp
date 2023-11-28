import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { FEE_API_ENDPOINT } from '@/constants'
import { PERIOD } from '@/views/FeeCompliant/PeriodTab'

export type NetworkComplianceScoreFetcherData = {
  network_compliance_score: number
}

const formatDate = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
  ' ' +
  [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')

const numByPeriod = {
  [PERIOD.SIXTY_DAYS]: 60,
  [PERIOD.WEEK]: 7,
  [PERIOD.DAY]: 1
}

export async function networkComplianceScoreFetcher(period: PERIOD) {
  const end_date = new Date()
  const start_date = new Date(new Date().setDate(end_date.getDate() - numByPeriod[period]))

  const data = await fetch(
    `${FEE_API_ENDPOINT}/monitoring/validator_fee_recipient/health/all?start_date=${formatDate(
      start_date
    )}&end_date=${formatDate(end_date)}`
  ).then((response) => response.json() as Promise<NetworkComplianceScoreFetcherData>)

  return data ?? null
}

export default function useNetworkComplianceScoreQuery(
  period: PERIOD,
  options?: UseQueryOptions<NetworkComplianceScoreFetcherData>
) {
  return useQuery<NetworkComplianceScoreFetcherData>(
    ['NetworkComplianceScore', period],
    () => networkComplianceScoreFetcher(period),
    {
      enabled: period !== undefined,
      ...options
    }
  )
}
