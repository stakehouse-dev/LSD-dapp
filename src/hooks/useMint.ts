import { useState } from 'react'

import { BalanceReportT } from '@/types'
import { notifyHash } from '@/utils/global'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useMint = () => {
  const [isSubmitting, setSubmitting] = useState(false)

  const { sdk } = useSDK()
  const { isGnosis } = useCustomAccount()

  const handleMint = async (liquidStakingManagerAddress: string, signatures: BalanceReportT[]) => {
    if (!sdk) return

    setSubmitting(true)
    const tx = await sdk.wizard.batchMintDerivatives(liquidStakingManagerAddress, signatures)
    if (!isGnosis) notifyHash(tx.hash)
    await tx.wait()
    setSubmitting(false)
    return tx
  }
  return { handleMint, isSubmitting }
}
