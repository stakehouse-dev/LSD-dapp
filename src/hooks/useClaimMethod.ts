import { ethers } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { useCallback, useState } from 'react'

import { WITHDRAW_MODE } from '@/constants'
import { notifyHash } from '@/utils/global'

import client from '../graphql/client'
import { ProtectedStakingPoolQuery } from '../graphql/queries/LPToken'
import { useCustomAccount, useSDK } from './'

export const useClaimMethod = () => {
  const { sdk } = useSDK()
  const { isGnosis } = useCustomAccount()
  const { account } = useCustomAccount()
  const address = account?.address

  const [isLoading, setLoading] = useState(false)

  const handleClaim = useCallback(
    async (
      mode: WITHDRAW_MODE,
      amount: number,
      poolAddress?: string,
      liquidStakingManager?: string | number,
      blsPublicKeys?: string[]
    ) => {
      setLoading(true)

      let result, lsmContractInstance, data

      switch (mode) {
        case WITHDRAW_MODE.STAKING:
          if (poolAddress) {
            data = await client.query({
              query: ProtectedStakingPoolQuery,
              variables: {
                lpAddr: poolAddress
              }
            })

            result = await sdk?.wizard.claimProtectedStakingRewardsForDirectDeposits(
              data.data.lptokens[0].issuer,
              poolAddress,
              parseEther(`${amount}`)
            )
          } else
            result = await sdk?.wizard.claimProtectedStakingRewards(
              address,
              ethers.utils.parseEther(`${amount}`)
            )

          break
        case WITHDRAW_MODE.FEES_MEV:
          if (poolAddress)
            try {
              result = await await sdk?.wizard.claimFeesAndMevRewardsForDirectDeposits(
                poolAddress,
                address,
                blsPublicKeys
              )
            } catch (err) {
              result = await await sdk?.wizard.claimExistingFeesAndMevRewardsForDirectDeposits(
                poolAddress,
                address,
                blsPublicKeys
              )
            }
          else
            result = await sdk?.wizard.claimFeesAndMevRewards(
              address,
              ethers.utils.parseEther(`${amount}`)
            )
          break
        case WITHDRAW_MODE.NODE_OPERATOR:
          lsmContractInstance = (await sdk?.contractInstance).liquidStakingManager(
            liquidStakingManager
          )

          result = await lsmContractInstance.claimRewardsAsNodeRunner(address, blsPublicKeys)
          break
      }

      if (!isGnosis) notifyHash(result.hash)
      await result.wait()
      setLoading(false)
      return result
    },
    [sdk]
  )

  return { handleClaim, isLoading, setLoading }
}
