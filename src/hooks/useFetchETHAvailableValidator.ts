import { useQuery } from '@apollo/client'
import { useCallback } from 'react'

import { WITHDRAW_MODE } from '@/constants'
import { GetLPTokenQuery } from '@/graphql/queries/LPToken'
import { notifyHash } from '@/utils/global'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useFetchETHAvailableValidator = (
  activeBlsKey: string | undefined,
  mode: WITHDRAW_MODE
) => {
  const { sdk } = useSDK()
  const { account, isGnosis } = useCustomAccount()
  const address = account?.address

  const { data: { lptokens } = {} } = useQuery(GetLPTokenQuery, {
    variables: {
      blsPublicKey: activeBlsKey,
      userAddress: address?.toLowerCase()
    },
    skip: !activeBlsKey || mode !== WITHDRAW_MODE.STAKING || !address
  })

  const batchPartialWithdrawal = useCallback(async () => {
    if (lptokens && lptokens.length > 0 && sdk && address) {
      try {
        const lpTokenAdressses = lptokens.map((token: any) => token.id)
        const savETHAddresses = lptokens.map((token: any) => token.liquidStakingNetwork.savETHPool)
        const amountResults = await Promise.all(
          lpTokenAdressses.map((lpToken: string) => sdk.wizard.lpTokenBalance(lpToken, address))
        )
        const result = await sdk.wizard.batchPartialWithdrawal(
          savETHAddresses[0],
          lpTokenAdressses,
          amountResults
        )

        if (!isGnosis) notifyHash(result.hash)
        await result.wait()
        return result
      } catch (err) {
        console.log('batchPartialWithdrawal error: ', err)
      }
    }

    return undefined
  }, [sdk, lptokens, address])

  return { batchPartialWithdrawal }
}
