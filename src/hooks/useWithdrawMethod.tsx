/* eslint-disable no-case-declarations */
import { Wizard } from '@blockswaplab/lsd-wizard'
import { ethers } from 'ethers'
import { useCallback, useState } from 'react'
import { useSigner } from 'wagmi'

import { WITHDRAW_MODE } from '@/constants'
import { notifyHash } from '@/utils/global'

import { useCustomAccount, useSDK } from '.'

export const useWithdrawMethod = () => {
  const { sdk } = useSDK()
  const { isGnosis } = useCustomAccount()
  const { account } = useCustomAccount()
  const address = account?.address

  const { data: signer } = useSigner()

  const [isLoading, setLoading] = useState(false)

  const handleWithdrawLPToken = async (
    mode: WITHDRAW_MODE,
    amount: number,
    liquidStakingManagerAddress: string,
    LSD: any,
    lpToken: string
  ) => {
    const wizard = new Wizard({
      signerOrProvider: signer,
      liquidStakingManagerAddress,
      savETHPoolAddress: LSD.savETHPool,
      feesAndMevPoolAddress: LSD.feesAndMevPool
    })

    let result = undefined
    setLoading(true)

    switch (mode) {
      case WITHDRAW_MODE.STAKING:
        result = await wizard.savETHPool.burnLPToken(lpToken, ethers.utils.parseEther(`${amount}`))
        break
      case WITHDRAW_MODE.FEES_MEV:
        result = await wizard.feesAndMevPool.burnLPTokenForETH(
          lpToken,
          ethers.utils.parseEther(`${amount}`)
        )
        break
    }

    if (!isGnosis) notifyHash(result.hash)
    await result.wait()

    setLoading(false)
    return result
  }
  const handleWithdrawUnstaked = async (params: any) => {
    setLoading(true)
    let transactions: any[] = []

    await Promise.all(
      params.deposits.map(
        async ({ amount, blsPublicKey, depositType, issuer, tokenAddress, tokenType }: any) => {
          switch (depositType) {
            case 'NODE_OPERATOR':
              const rageQuitAssistantAddress =
                await sdk?.wizard.getRageQuitAssistantForBLSPublicKey(issuer, blsPublicKey)

              const tx = await sdk?.wizard.nodeOperatorClaimFromRageQuitAssistant(
                rageQuitAssistantAddress
              )
              if (!isGnosis) notifyHash(tx.transactionHash)
              transactions = [
                ...transactions,
                { txName: 'Node operator withdrawal', transaction: tx }
              ]
              break
            case 'DIRECT_DEPOSIT':
              if (tokenType == 'SAVETH') {
                const tx = await sdk?.wizard.rageQuitDETHClaim(issuer, amount)
                if (!isGnosis) notifyHash(tx.transactionHash)
                transactions = [
                  ...transactions,
                  { txName: 'Protected Staking Withdrawal', transaction: tx }
                ]
              } else if (tokenType == 'FEES_AND_MEV') {
                const tx = await sdk?.wizard.rageQuitSETHClaim(issuer, amount)
                if (!isGnosis) notifyHash(tx.transactionHash)
                transactions = [
                  ...transactions,
                  { txName: 'MEV Staking Withdrawal', transaction: tx }
                ]
              }
              break
            case 'FREN_DELEGATION':
              if (tokenType == 'SAVETH') {
                const contract = (await sdk?.contractInstance).savETHPool(issuer)

                const tx = await contract.claimETHFromRageQuit(tokenAddress, amount)

                if (!isGnosis) notifyHash(tx.transactionHash)
                transactions = [
                  ...transactions,
                  { txName: 'Protected Staking Withdrawal', transaction: tx }
                ]
              } else if (tokenType == 'FEES_AND_MEV') {
                const contract = (await sdk?.contractInstance).feesAndMevPool(issuer)

                const tx = await contract.claimETHFromRageQuit(tokenAddress, amount)

                if (!isGnosis) notifyHash(tx.transactionHash)
                transactions = [
                  ...transactions,
                  { txName: 'MEV Staking Withdrawal', transaction: tx }
                ]
              }
              break
            case 'GIANT_POOL':
              if (tokenType == 'SAVETH') {
                const contract = (await sdk?.contractInstance).giantSavETHPool()

                const ethFromRageQuit = await contract.ethFromRageQuitForBlsKey(blsPublicKey)

                if (ethFromRageQuit == 0) {
                  const tx = await contract.batchFetchETHFromRageQuit(
                    [issuer],
                    [[tokenAddress]],
                    [[amount]]
                  )
                  await tx.wait(2)
                }

                const tx = await contract.batchClaimETHFromRageQuit([blsPublicKey])

                if (!isGnosis) notifyHash(tx.transactionHash)
                transactions = [
                  ...transactions,
                  { txName: 'Protected Staking Withdrawal', transaction: tx }
                ]
              } else if (tokenType == 'FEES_AND_MEV') {
                const contract = (await sdk?.contractInstance).giantFeesAndMEV()

                const ethFromRageQuit = await contract.ethFromRageQuitForBlsKey(blsPublicKey)

                if (ethFromRageQuit == 0) {
                  const tx = await contract.batchFetchETHFromRageQuit(
                    [issuer],
                    [[tokenAddress]],
                    [['4000000000000000000']]
                  )
                  await tx.wait(1)
                }

                const tx = await contract.batchClaimETHFromRageQuit([blsPublicKey])

                if (!isGnosis) notifyHash(tx.transactionHash)
                transactions = [
                  ...transactions,
                  { txName: 'MEV Staking Withdrawal', transaction: tx }
                ]
              }
              break
          }
        }
      )
    )

    const txs = await Promise.all(transactions.map(async (item) => await item.transaction.wait()))

    setLoading(false)

    return transactions
  }

  const handleWithdraw = useCallback(
    async (
      mode: WITHDRAW_MODE,
      amount: number,
      liquidStakingManagerAddress?: string | number,
      blsPublicKey?: string | number
    ) => {
      setLoading(true)
      let pool = undefined,
        liquidStakingManager = undefined
      switch (mode) {
        case WITHDRAW_MODE.STAKING:
          pool = (await sdk?.contractInstance).giantSavETHPool()
          break
        case WITHDRAW_MODE.FEES_MEV:
          pool = (await sdk?.contractInstance).giantFeesAndMEV()
          break
        case WITHDRAW_MODE.NODE_OPERATOR:
          liquidStakingManager = (await sdk?.contractInstance).liquidStakingManager(
            liquidStakingManagerAddress
          )
          break
      }
      let result
      if (mode === WITHDRAW_MODE.NODE_OPERATOR)
        result = await liquidStakingManager.withdrawETHForKnot(address, blsPublicKey)
      else result = await pool.withdrawETH(ethers.utils.parseEther(`${amount}`))

      if (!isGnosis) notifyHash(result.hash)
      await result.wait()

      setLoading(false)
      return result
    },
    [sdk]
  )

  return { handleWithdraw, isLoading, setLoading, handleWithdrawLPToken, handleWithdrawUnstaked }
}
