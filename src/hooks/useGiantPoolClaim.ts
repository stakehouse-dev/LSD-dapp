import { notifyHash } from '../utils/global'
import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useGiantPoolClaim = () => {
  const { sdk } = useSDK()
  const { account, isGnosis } = useCustomAccount()
  const address = account?.address

  const batchPartialWithdrawalFromGiantSavETHPool = async () => {
    if (sdk && address) {
      try {
        const {
          withdrawable: { savETHPoolAddresses, lpTokenAddresses, claimAmounts }
        } = await sdk.withdrawal.getGiantPoolValidatorsForPartialWithdrawal(address.toLowerCase())

        if (savETHPoolAddresses?.length > 0) {
          const result = await sdk.wizard.batchPartialWithdrawalFromGiantSavETHPool(
            savETHPoolAddresses,
            lpTokenAddresses,
            claimAmounts
          )

          if (!isGnosis) notifyHash(result.hash)
          await result.wait()
          return result
        }
      } catch (err) {
        console.log('error: ', err)
      }
    }

    return undefined
  }

  const batchClaimETHFromPartialWithdrawal = async () => {
    if (sdk && address) {
      try {
        const {
          claimable: {
            savETHPoolAddresses: claimableSavETHPoolAddresses,
            lpTokenAddresses: claimableLpTokenAddresses
          }
        } = await sdk.withdrawal.getGiantPoolValidatorsForPartialWithdrawal(address.toLowerCase())

        if (claimableSavETHPoolAddresses?.length > 0) {
          const result = await sdk.wizard.batchClaimETHFromPartialWithdrawal(
            claimableSavETHPoolAddresses,
            claimableLpTokenAddresses
          )

          if (!isGnosis) notifyHash(result.hash)
          await result.wait()
          return result
        }
      } catch (err) {
        console.log('error: ', err)
      }
    }

    return undefined
  }

  return { batchPartialWithdrawalFromGiantSavETHPool, batchClaimETHFromPartialWithdrawal }
}
