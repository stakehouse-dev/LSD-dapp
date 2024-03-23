import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { KeystoreT } from '@/types'

import { useCustomAccount } from './useCustomAccount'
import { useSDK } from './useSDK'

export const useStake = () => {
  const [isLoading, setLoading] = useState(false)

  const { sdk } = useSDK()
  const { account } = useCustomAccount()
  const address = account?.address

  const { connector: activeConnector } = useAccount()

  const handleApproveStake = useCallback(
    async (
      password: string | null,
      keystores: KeystoreT[] | null,
      blsKeys: string[],
      liquidStakingManagerAddress: string
    ) => {
      if (sdk && activeConnector && address) {
        const provider = await activeConnector.getProvider()
        setLoading(true)
        let batchDepositData = []
        try {
          for (let i = 0; i < blsKeys.length; ++i) {
            const depositData = await sdk.utils.getDepositDataFromOnChainRegistrationInfo(
              blsKeys[i]
            )
            batchDepositData.push(depositData[0])
          }
        } catch (err) {
          console.log('getDepositDataFromOnChainRegistrationInfo err: ', err)
          return null
        }

        let batchDepositSignature = []
        let blsSignatures = []

        for (let i = 0; i < batchDepositData.length; ++i) {
          blsSignatures.push(sdk.utils.add0x(batchDepositData[i].signature))
        }

        try {
          batchDepositSignature = await sdk.utils.getBatchPersonalSignInitials(
            provider,
            blsKeys.map((key) => sdk.utils.add0x(key)),
            blsSignatures,
            address,
            activeConnector.name === 'WalletConnect'
          )
        } catch (err) {
          console.log('getBatchPersonalSignInitials err: ', err)
          throw err
        }

        try {
          const authenticatedResult = await sdk.batchBLSAuthentication(
            password,
            keystores,
            batchDepositData,
            batchDepositSignature
          )
          const result = await sdk.wizard.batchStake(
            liquidStakingManagerAddress,
            authenticatedResult
          )
          return result
        } catch (err) {
          console.log('approve stake err: ', err)
          return null
        }
      }
    },
    [sdk, activeConnector, address]
  )

  return { isLoading, handleApproveStake, setLoading }
}
