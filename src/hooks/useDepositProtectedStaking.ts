import { ethers } from 'ethers'
import { useCallback, useState } from 'react'

import { notifyHash } from '@/utils/global'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useDepositProtectedStaking = () => {
  const { sdk } = useSDK()
  const { isGnosis } = useCustomAccount()

  const [isLoading, setLoading] = useState(false)

  const handleDeposit = useCallback(
    async (amount: number) => {
      if (sdk) {
        setLoading(true)
        const result = await sdk.wizard.depositETHForProtectedStaking(
          ethers.utils.parseEther(`${amount}`)
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
