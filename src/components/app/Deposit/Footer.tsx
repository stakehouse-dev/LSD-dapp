import 'twin.macro'

import { useQuery } from '@apollo/client'
import { BigNumber, ethers } from 'ethers'
import { FC, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBalance } from 'wagmi'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import BlueEthIcon from '@/assets/images/icon-blue-eth.svg'
import { ReactComponent as DEthIcon } from '@/assets/images/icon-deth.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { ReactComponent as LayerIcon } from '@/assets/images/icon-layers.svg'
import { BEACON_NODE_URL } from '@/constants/chains'
import { config } from '@/constants/environment'
import { RewardsContext } from '@/context/RewardsContext'
import { StakingStoreContext } from '@/context/StakingStoreContext'
import { getLSDValidatorsCount } from '@/graphql/queries/lsdValidators'
import { useAvailableToStake, useCustomAccount, useInProgress, useSDK } from '@/hooks'
import { bigToNum, roundNumber } from '@/utils/global'

interface IDepositFooter {
  from?: 'Node Runner' | 'Staking' | 'FeesMev' | 'Main'
}

export const DepositFooter: FC<IDepositFooter> = ({ from = 'Main' }) => {
  const navigate = useNavigate()

  const { stakingETH, feesMevETH, refetchFeesMevEth, refetchStakingEth } =
    useContext(StakingStoreContext)
  const { sdk } = useSDK()
  const { account } = useCustomAccount()
  const { amount: availableToStake } = useAvailableToStake(from)
  const { amount: inProgress } = useInProgress(from)
  const { rewards, refetch: refetchRewards } = useContext(RewardsContext)
  const { data: { formatted: availableAmount } = {} } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    token: config.dethTokenAddress as `0x${string}`,
    chainId: config.networkId
  })

  const { data: { lsdvalidators } = {} } = useQuery(getLSDValidatorsCount)

  const [ethAmount, setETHAmount] = useState(0)

  const fetchTotalAvailableETH = useCallback(async () => {
    if (availableAmount && Number(availableAmount) >= 0 && sdk && account) {
      let result
      try {
        result = await sdk.withdrawal.getValidatorsEligibleForPartialWithdrawal(BEACON_NODE_URL)
      } catch (err) {
        console.log('cache error and call again', err)
      }

      const { eligibleValidatorsBeaconChainReports, validatorsForReporting } = result

      try {
        const { unwrapAmounts } = await sdk.withdrawal.getOpenIndexValidatorsForPartialWithdrawal(
          account.address,
          `${ethers.utils.parseEther(availableAmount)}`,
          eligibleValidatorsBeaconChainReports
        )
        let sumETH = 0
        if (unwrapAmounts && unwrapAmounts.length > 0) {
          unwrapAmounts.forEach((uAmount: BigNumber) => {
            sumETH += bigToNum(uAmount)
          })
        }
        setETHAmount(sumETH)
      } catch (err) {
        console.log('fetchTotalAvailableETH error: ', err)
      }
    }
  }, [sdk, account && availableAmount])

  useEffect(() => {
    fetchTotalAvailableETH()
  }, [fetchTotalAvailableETH])

  useEffect(() => {
    handleRefresh()
  }, [from])

  const handleRefresh = () => {
    refetchFeesMevEth()
    refetchRewards()
    refetchStakingEth()
  }

  const handleGoRewardStaking = () => {
    navigate('/manage/rewards/staking')
  }

  const handleGoRewardFees = () => {
    navigate('/manage/rewards/fees')
  }

  const handleGoRedeem = () => {
    navigate('/manage/redeem')
  }

  return (
    <div className="content__status">
      {from === 'Main' || from === 'Node Runner' ? (
        <>
          <div className="flex justify-between">
            <div className="content__status__label">
              <EthIcon />
              Protected Staking Giant Pool
            </div>
            <div className="content__status__value">
              {stakingETH.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
            </div>
          </div>
          <div className="flex justify-between">
            <div className="content__status__label">
              <EthIcon />
              MEV Staking Giant Pool
            </div>
            <div className="content__status__value">
              {feesMevETH.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
            </div>
          </div>
          <div className="flex justify-between">
            <div className="content__status__label ml-0.5">
              <LayerIcon />
              Validators waiting for ETH
            </div>
            <div className="content__status__value">{lsdvalidators ? lsdvalidators.length : 0}</div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <div className="content__status__label">
              <EthIcon />
              {from === 'Staking' ? 'Protected Staking Giant Pool' : 'MEV Staking Giant Pool'}
            </div>
            <div className="content__status__value">
              {availableToStake.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
            </div>
          </div>
          <div className="flex justify-between">
            <div className="content__status__label">
              <EthIcon />
              ETH being Staked
            </div>
            <div className="content__status__value">
              {inProgress.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH
            </div>
          </div>
        </>
      )}
      <div className="content__status__box">
        <div className="flex justify-between">
          <div className="content__status__label">
            <DEthIcon />
            Available to Claim
          </div>
          <div
            className={`content__status__value cursor-pointer ${
              Number(rewards?.staking || 0) > 0 && 'positive'
            }`}
            onClick={handleGoRewardStaking}>
            {roundNumber(rewards?.staking || 0, 3)} dETH <ArrowTopRightIcon />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="content__status__label">
            <EthIcon />
            Available to Claim
          </div>
          <div
            className={`content__status__value cursor-pointer ${
              Number(rewards?.feesMev || 0) > 0 && 'positive'
            }`}
            onClick={handleGoRewardFees}>
            {roundNumber(rewards?.feesMev || 0, 3)} ETH <ArrowTopRightIcon />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="content__status__label">
            <img src={BlueEthIcon} alt="blueEthIcon" />
            Redeem dETH to ETH
          </div>
          <div
            className={`content__status__value cursor-pointer ${
              Number(ethAmount || 0) > 0 && 'positive'
            }`}
            onClick={handleGoRedeem}>
            {roundNumber(Number(ethAmount) || 0, 3)} dETH <ArrowTopRightIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
