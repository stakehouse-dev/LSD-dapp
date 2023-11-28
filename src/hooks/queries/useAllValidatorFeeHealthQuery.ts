import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { FEE_API_ENDPOINT } from '@/constants'
import { PERIOD } from '@/views/FeeCompliant/PeriodTab'

export type AllValidatorFeeHealthFetcherData = {
  data: {
    validator_id: string
    compliance_score: number
    compliant_count: number
    non_compliant_count: number
  }[]
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

export async function allValidatorFeeHealthFetcher(period: PERIOD) {
  const end_date = new Date()
  const start_date = new Date(new Date().setDate(end_date.getDate() - numByPeriod[period]))

  const data = await fetch(
    `${FEE_API_ENDPOINT}/monitoring/validator_fee_recipient/health/all/by_time_division?start_date=${formatDate(
      start_date
    )}&end_date=${formatDate(end_date)}&time_divisions=${60}`
  ).then((response) => response.json() as Promise<AllValidatorFeeHealthFetcherData>)

  return data ?? null
}

export default function useAllValidatorFeeHealthQuery(
  period: PERIOD,
  options?: UseQueryOptions<AllValidatorFeeHealthFetcherData>
) {
  return useQuery<AllValidatorFeeHealthFetcherData>(
    ['AllValidatorFeeHealthQuery', period],
    () => allValidatorFeeHealthFetcher(period),
    {
      enabled: period !== undefined,
      ...options
    }
  )
}
