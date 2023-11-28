import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { BEACON_NODE_URL } from '@/constants/chains'
import { EligibleValidator } from '@/types'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useTotalAvailableETH = () => {
  const { sdk } = useSDK()
  const { account } = useCustomAccount()

  const [eligibleValidators, setEligibleValidators] = useState<EligibleValidator[]>([])
  const [validatorsForReporting, setValidatorsForReporting] = useState<any[]>([])

  useEffect(() => {
    const fetchEligibleValidatorsForRedeem = async () => {
      if (sdk) {
        try {
          const { eligibleValidatorsBeaconChainReports, validatorsForReporting } =
            await sdk.withdrawal.getValidatorsEligibleForPartialWithdrawal(BEACON_NODE_URL)

          setEligibleValidators(eligibleValidatorsBeaconChainReports)
          setValidatorsForReporting(
            validatorsForReporting.map((v: any) => ({
              beaconReport: v,
              selected: true
            }))
          )
        } catch (err) {
          console.log('getValidatorsEligibleForPartialWithdrawal err: ', err)
        }
      }
    }

    fetchEligibleValidatorsForRedeem()
  }, [sdk])

  const fetchTotalAvailableETH = useCallback(
    async (amount: string) => {
      if (amount !== '.' && sdk && account && eligibleValidators.length > 0) {
        try {
          const {
            totalAvailableETH,
            validatorsInOpenIndex,
            finalisedReportsForPartialWithdrawal,
            unwrapAmounts
          } = await sdk.withdrawal.getOpenIndexValidatorsForPartialWithdrawal(
            account.address,
            `${ethers.utils.parseEther(amount)}`,
            eligibleValidators
          )

          return {
            totalAvailableETH,
            validatorsInOpenIndex,
            finalisedReportsForPartialWithdrawal,
            unwrapAmounts
          }
        } catch (err) {
          console.log('getOpenIndexValidatorsForPartialWithdrawal: ', err)
          return undefined
        }
      } else {
        return undefined
      }
    },
    [sdk, account, eligibleValidators]
  )

  return { fetchTotalAvailableETH, validatorsForReporting }
}
