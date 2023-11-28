import { ethers } from 'ethers'
import { useCallback, useState } from 'react'

import { DepositObjectT } from '@/types'
import { notifyHash } from '@/utils/global'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useDepositNodeRunner = () => {
  const { sdk } = useSDK()
  const { isGnosis } = useCustomAccount()

  const [isLoading, setLoading] = useState(false)

  const handleDeposit = useCallback(
    async (
      liquidStakingManagerAddress: string,
      depositData: DepositObjectT,
      eoaRepresentative: string
    ) => {
      if (sdk) {
        const ethAmount = ethers.utils.parseEther(`${4 * depositData.length}.0`)
        setLoading(true)
        const result = await sdk.wizard.batchDepositNodeOperators(
          liquidStakingManagerAddress,
          depositData.map((object) => object),
          eoaRepresentative,
          ethAmount
        )
        if (!isGnosis) notifyHash(result.hash)
        await result.wait()
        setLoading(false)
        return result
      }
    },
    [sdk]
  )

  return { handleDeposit, isLoading, setLoading }
}
