import { useQuery } from '@apollo/client'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import client from '@/graphql/client'
import { GetLPTokenQuery } from '@/graphql/queries/LPToken'
import { LSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import { SmartWalletQuery } from '@/graphql/queries/NodeRunners'
import { GetProtectedBatchesQuery } from '@/graphql/queries/PortfolioQuery'
import { TLSDNetwork } from '@/types'

import { useCustomAccount, useLSDNetworkList, useSDK } from '.'

export const useTotalRewardBalance = () => {
  const { sdk } = useSDK()
  const { isConnected } = useAccount()
  const { account } = useCustomAccount()
  const address = account?.address

  const [balance, setBalance] = useState<any>(0)
  const [rewards, setRewards] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const [isEligible, setEligible] = useState(true)

  const { list } = useLSDNetworkList()

  const { data: { protectedBatches } = {} } = useQuery(GetProtectedBatchesQuery, {
    variables: {
      account: account?.address.toLowerCase()
    },
    skip: !account
  })

  const fetch = useCallback(async () => {
    if (sdk && list.length > 0 && address) {
      setLoading(true)
      let rewardResult: any = {}

      let totalProtectedStakingBalance = BigNumber.from(0),
        totalFeesAndMevBalance = BigNumber.from(0),
        listOfProtectedStakingBalance: any[] = []

      try {
        const result = await sdk?.wizard.getLPTokenBalances(address ?? '')
        const {
          totalProtectedStakingBalance: _totalProtectedStakingBalance,
          totalFeesAndMevBalance: _totalFeesAndMevBalance,
          listOfProtectedStakingBalance: _listOfProtectedStakingBalance
        } = result

        totalFeesAndMevBalance = _totalFeesAndMevBalance
        totalProtectedStakingBalance = _totalProtectedStakingBalance

        listOfProtectedStakingBalance = _listOfProtectedStakingBalance

        for (let i = 0; i < listOfProtectedStakingBalance.length; i += 1) {
          const item = listOfProtectedStakingBalance[i]

          const {
            data: { lptokens }
          } = await client.query({
            query: GetLPTokenQuery,
            variables: {
              blsPublicKey: item.blsPublicKey,
              userAddress: address?.toLowerCase()
            }
          })

          if (lptokens && lptokens.length > 0) {
            const lpTokenAdressses = lptokens.map((token: any) => token.id)
            const savETHAddresses = lptokens.map(
              (token: any) => token.liquidStakingNetwork.savETHPool
            )

            try {
              const result = await sdk?.wizard.previewPartialETHWithdrawalAmount(
                savETHAddresses[0],
                address?.toLowerCase(),
                lpTokenAdressses
              )

              totalProtectedStakingBalance = totalProtectedStakingBalance.add(result)
            } catch (err) {
              console.log('previewPartialETHWithdrawalAmount error: ', err)
            }
          }
        }
      } catch (error) {
        console.log('getLPTokenBalances error: ', error)
      }

      let stakingBalance = undefined
      try {
        stakingBalance = await sdk?.wizard.previewClaimableProtectedStakingLP(
          address?.toLowerCase() ?? ''
        )
        if (protectedBatches && protectedBatches.length != 0) {
          const savETHVaultAddresses = protectedBatches.map(
            (pBatch: any) => pBatch.vaultLPToken.liquidStakingNetwork.savETHPool
          )
          const lpTokenAddresses = protectedBatches.map((pBatch: any) => [pBatch.vaultLPToken.id])
          const result = await sdk?.wizard.previewPartialWithdrawalClaimableETH(
            address,
            savETHVaultAddresses,
            lpTokenAddresses
          )
          stakingBalance = stakingBalance.add(result)
        }
      } catch (err) {
        console.log('staking balance error: ', err)
      }

      let feesMevBalance = undefined
      try {
        feesMevBalance = await sdk?.wizard.previewFeesAndMevRewards(address?.toLowerCase() ?? '')
      } catch (err) {
        console.log('feesMevBalance error: ', err)
      }

      try {
        rewardResult = {
          staking: stakingBalance
            ? Number(formatEther(stakingBalance)) +
              Number(formatEther(totalProtectedStakingBalance))
            : 0,
          feesMev: feesMevBalance
            ? Number(formatEther(feesMevBalance)) + Number(formatEther(totalFeesAndMevBalance))
            : 0
        }
      } catch (error) {
        rewardResult = {
          staking: Number(formatEther(totalProtectedStakingBalance)),
          feesMev: Number(formatEther(totalFeesAndMevBalance))
        }
      }

      let nodeOperatorBalance: any = {}
      let totalNodeOperatorBalance = 0

      try {
        await Promise.all(
          list.map(async (network: TLSDNetwork) => {
            const { data } = await client.query({
              query: LSDNetworksQuery,
              variables: {
                liquidStakingManager: network.liquidStakingManager
              }
            })

            const { data: smartWalletData } = await client.query({
              query: SmartWalletQuery,
              variables: {
                account: address?.toLowerCase(),
                network: network.liquidStakingManager
              }
            })

            const syndicateAddress = data.liquidStakingNetworks[0].feeRecipientAndSyndicate

            let smartWallet = null
            if (smartWalletData.nodeRunners.length > 0)
              smartWallet = smartWalletData.nodeRunners[0].smartWallets[0].id

            if (smartWallet) {
              const _balance = await sdk?.wizard.previewNodeOperatorRewards(
                syndicateAddress,
                network.liquidStakingManager,
                address,
                smartWallet
              )

              nodeOperatorBalance[network.liquidStakingManager] = Number(formatEther(_balance))
              totalNodeOperatorBalance += Number(formatEther(_balance))
            }
          })
        )
      } catch (err) {
        console.log('nodeOperatorbalance error: ', err)
      }

      rewardResult = {
        ...rewardResult,
        nodeOperator: nodeOperatorBalance,
        totalNodeOperatorBalance
      }

      setRewards(rewardResult)
      setBalance(rewardResult.staking + rewardResult.feesMev + totalNodeOperatorBalance)

      setLoading(false)
    } else {
      setBalance(0)
      setRewards(undefined)
    }
  }, [list, sdk, address])

  useEffect(() => {
    fetch()
  }, [fetch, address, isConnected])

  return { balance: isConnected ? balance : 0, rewards, isEligible, loading, refetch: fetch }
}
