import { useQuery } from '@apollo/client'
import { BigNumber, ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'

import { WITHDRAW_MODE } from '@/constants'
import { DETH_WITHDRAW_TOKENS, TokenT } from '@/constants/tokens'
import client from '@/graphql/client'
import { GetLPTokenQuery } from '@/graphql/queries/LPToken'
import { GetProtectedBatchesQuery } from '@/graphql/queries/PortfolioQuery'
import { roundNumber } from '@/utils/global'

import { IBlsKeyOption, ILSDNetworkOption, useCustomAccount, useSDK } from '.'

export const useRewardBalance = (mode: WITHDRAW_MODE, selectedToken: TokenT) => {
  const { sdk } = useSDK()
  const { account } = useCustomAccount()
  const address = account?.address

  const [balance, setBalance] = useState<string>('0.0')
  const [loading, setLoading] = useState<boolean>(true)
  const [LSDs, setLSDs] = useState<ILSDNetworkOption>()
  const [validators, setValidators] = useState<Record<string, IBlsKeyOption[]>>()

  const { data: { protectedBatches } = {} } = useQuery(GetProtectedBatchesQuery, {
    variables: {
      account: account?.address.toLowerCase()
    },
    skip: !account
  })

  const initBalance = useCallback(async () => {
    if (mode !== WITHDRAW_MODE.NODE_OPERATOR && sdk && address && protectedBatches) {
      setLoading(true)

      let totalProtectedStakingBalance = BigNumber.from(0),
        totalFeesAndMevBalance = BigNumber.from(0),
        listOfFeesAndMevBalance: any[] = [],
        listOfProtectedStakingBalance: any[] = []

      try {
        const result = await sdk?.wizard.getLPTokenBalances(address ?? '')
        const {
          totalProtectedStakingBalance: _totalProtectedStakingBalance,
          totalFeesAndMevBalance: _totalFeesAndMevBalance,
          listOfFeesAndMevBalance: _listOfFeesAndMevBalance,
          listOfProtectedStakingBalance: _listOfProtectedStakingBalance
        } = result

        totalFeesAndMevBalance = _totalFeesAndMevBalance
        if (selectedToken === DETH_WITHDRAW_TOKENS[0])
          totalProtectedStakingBalance = _totalProtectedStakingBalance
        listOfFeesAndMevBalance = _listOfFeesAndMevBalance
        listOfProtectedStakingBalance = _listOfProtectedStakingBalance
      } catch (error) {
        console.log('getLPTokenBalances error: ', error)
      }

      const networks: ILSDNetworkOption = {}
      const blsKeys: Record<string, IBlsKeyOption[]> = {}

      let giantBalance = 0
      let giantETHBalance = `0`
      let giantDETHBalance = `0`
      let totalBalance = 0

      switch (mode) {
        case WITHDRAW_MODE.STAKING:
          try {
            const rawGiantBalance = formatEther(
              await sdk?.wizard.previewClaimableProtectedStakingLP(address?.toLowerCase() ?? '')
            )
            giantDETHBalance = `${Number(rawGiantBalance)}`
            ////////////////////////////////////////////////////////////////////////////////////////
            const savETHVaultAddresses = protectedBatches.map(
              (pBatch: any) => pBatch.vaultLPToken.liquidStakingNetwork.savETHPool
            )
            const lpTokenAddresses = protectedBatches.map((pBatch: any) => [pBatch.vaultLPToken.id])
            const result = await sdk?.wizard.previewPartialWithdrawalClaimableETH(
              address,
              savETHVaultAddresses,
              lpTokenAddresses
            )
            giantETHBalance = ethers.utils.formatEther(result)

            if (selectedToken === DETH_WITHDRAW_TOKENS[0]) {
              giantBalance = Number(rawGiantBalance)
            } else if (protectedBatches) {
              giantBalance = Number(ethers.utils.formatEther(result))
            }
            totalBalance += giantBalance
          } catch (error) {
            console.log('prev func calls error: ', error)
          }
          networks['giant_pool'] = {
            ticker: 'Giant Pool',
            balance: giantBalance,
            dethBalance: giantDETHBalance,
            ethBalance: giantETHBalance,
            rawBalance: giantBalance.toString()
          }

          for (let i = 0; i < listOfProtectedStakingBalance.length; i += 1) {
            const item = listOfProtectedStakingBalance[i]
            let balance = 0
            let balanceDETH = Number(formatEther(item.value))
            let balanceETH = 0

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
                balanceETH = Number(formatEther(result))
              } catch (err) {
                console.log('previewPartialETHWithdrawalAmount error: ', err)
              }
            }

            if (selectedToken === DETH_WITHDRAW_TOKENS[0]) {
              balance = balanceDETH
            } else {
              balance = balanceETH
            }
            totalBalance += balance

            if (item.lsd in networks) {
              networks[item.lsd].balance += balance
            } else {
              networks[item.lsd] = {
                ticker: item.lsd,
                balance: balance,
                dethBalance: `${balanceDETH}`,
                ethBalance: `${balanceETH}`
              }
            }

            if (item.lsd in blsKeys) {
              blsKeys[item.lsd] = [
                ...blsKeys[item.lsd],
                {
                  blsKey: item.blsPublicKey,
                  balance: balance,
                  rawBalance: `${balance}`,
                  lpToken: item.lpToken,
                  dethBalance: `${balanceDETH}`,
                  ethBalance: `${balanceETH}`
                }
              ]
            } else {
              blsKeys[item.lsd] = [
                {
                  blsKey: item.blsPublicKey,
                  balance: balance,
                  rawBalance: `${balance}`,
                  lpToken: item.lpToken,
                  dethBalance: `${balanceDETH}`,
                  ethBalance: `${balanceETH}`
                }
              ]
            }
          }
          totalProtectedStakingBalance = ethers.utils.parseEther(`${totalBalance}`)

          setValidators(blsKeys)
          setLSDs(networks)
          setBalance(roundNumber(Number(formatEther(totalProtectedStakingBalance)), 3))
          break
        case WITHDRAW_MODE.FEES_MEV:
          try {
            giantBalance = Number(
              formatEther(await sdk?.wizard.previewFeesAndMevRewards(address?.toLowerCase() ?? ''))
            )
          } catch (error) {
            console.log('previewFeesAndMevRewards error: ', error)
          }

          networks['giant_pool'] = {
            ticker: 'Giant Pool',
            balance: giantBalance,
            rawBalance: giantBalance.toString()
          }

          listOfFeesAndMevBalance.map((item: any) => {
            if (item.lsd in networks) {
              networks[item.lsd].balance += Number(formatEther(item.value))
            } else
              networks[item.lsd] = {
                ticker: item.lsd,
                balance: Number(formatEther(item.value)),
                rawBalance: formatEther(item.value),
                feesAndMevPool: item.feesAndMevPoolAddress,
                blsKeys: item.blsPublicKeys
              }
          })
          setLSDs(networks)
          setBalance(roundNumber(Number(formatEther(totalFeesAndMevBalance)) + giantBalance, 3))
          break

        default:
          break
      }

      setLoading(false)
    }
  }, [sdk, address, selectedToken, protectedBatches, mode])

  useEffect(() => {
    initBalance()
  }, [initBalance])

  return { balance, loading, refetch: initBalance, LSDs, validators, protectedBatches }
}
