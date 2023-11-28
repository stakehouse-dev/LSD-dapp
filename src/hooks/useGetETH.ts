import { ethers } from 'ethers'
import { useCallback, useState } from 'react'

import { handleErr, noty } from '../utils/global'
import { useSDK } from './useSDK'

export const useGetETH = () => {
  const { sdk } = useSDK()
  const [isLoading, setLoading] = useState(false)

  const handleGetSavETH = useCallback(
    async (blsPublicKeys: string[], liquidStakingManagerAddress: string, funds: number[]) => {
      if (sdk) {
        setLoading(true)
        try {
          await sdk.wizard.rotateFundsBackToGiantProtectedStakingPool()
        } catch (err) {
          console.log('rotateFundsBackToGiantProtectedStakingPool error---------')
        }

        try {
          const tx = await sdk.wizard.batchFundNodeOperatorFromGiantSavETHPool(
            liquidStakingManagerAddress,
            blsPublicKeys,
            funds.map((fund) => ethers.utils.parseEther(`${fund}`))
          )
          return tx
        } catch (err) {
          console.log('batchFundNodeOperatorFromGiantSavETHPool error---------')
          console.log(err)
          noty(handleErr(err, 'Something went wrong.'))
          setLoading(false)
          return null
        }
      }
    },
    [sdk]
  )

  const handleGetFeesMevETH = useCallback(
    async (blsPublicKeys: string[], liquidStakingManagerAddress: string, funds: number[]) => {
      if (sdk) {
        setLoading(true)
        try {
          await sdk.wizard.rotateFundsBackToGiantFeesAndMevPool()
        } catch (err) {
          console.log('rotateFundsBackToGiantFeesAndMevPool error---------')
        }

        try {
          const result = await sdk.wizard.batchFundNodeOperatorFromGiantFeesAndMevPool(
            liquidStakingManagerAddress,
            blsPublicKeys,
            funds.map((fund) => ethers.utils.parseEther(`${fund}`))
          )
          return result
        } catch (err) {
          console.log('batchFundNodeOperatorFromGiantFeesAndMevPool error---------')
          console.log(err)
          noty(handleErr(err, 'Something went wrong.'))
          return null
        }
      }
    },
    [sdk]
  )

  return { handleGetFeesMevETH, handleGetSavETH, setLoading, isLoading }
}
