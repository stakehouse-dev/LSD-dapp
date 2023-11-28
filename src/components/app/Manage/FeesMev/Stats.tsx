import { FC, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ReactComponent as DEthIcon } from '@/assets/images/icon-deth.svg'
import { ReactComponent as DEthIcon2 } from '@/assets/images/icon-deth2.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { HoverCard } from '@/components/shared'
import { WITHDRAW_MODE } from '@/constants'
import { RewardsContext } from '@/context/RewardsContext'
import {
  useFetchLsdValidators,
  usePortfolioFeesMev,
  useStakedBalance,
  useWithdrawBalance
} from '@/hooks'
import { roundNumber } from '@/utils/global'

const Stats: FC = () => {
  const navigate = useNavigate()
  const { rewards } = useContext(RewardsContext)

  const { validators } = useFetchLsdValidators()
  const { payouts, numberOfKnots, numberOflsdNetworks } = usePortfolioFeesMev()
  const { balance: stakedBalance } = useStakedBalance(WITHDRAW_MODE.FEES_MEV)
  const { balance: depositedBalance } = useWithdrawBalance(
    validators.length > 0,
    WITHDRAW_MODE.FEES_MEV
  )

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 border border-solid border-innerBorder rounded-2xl px-8 py-6 gap-4 text-sm font-medium mb-8">
      <div className="flex flex-col bg-grey200 px-8 py-6 rounded-2xl gap-2 justify-center">
        <Title>Total Rewards Earned</Title>
        <TotalETH>
          {Number(payouts).toLocaleString(undefined, {
            maximumFractionDigits: 2
          })}{' '}
          <span>ETH</span>
        </TotalETH>
        <StatItem>
          <Label>
            <DEthIcon />
            Available to Claim
          </Label>
          <span
            className="text-primary flex items-center gap-1 cursor-pointer"
            onClick={() => navigate('/manage/rewards/fees')}>
            {roundNumber(rewards.feesMev, 3)} ETH <ArrowTopRightIcon />
          </span>
        </StatItem>
      </div>
      <StatBox>
        <Title>Portfolio Assets</Title>
        <StatItem>
          <Label>
            <EthIcon />
            Deposited ETH
          </Label>
          <span>{depositedBalance}</span>
        </StatItem>
        <StatItem>
          <Label>
            {' '}
            <DEthIcon2 />
            Staked ETH
          </Label>
          <span>{stakedBalance}</span>
        </StatItem>
      </StatBox>
      <StatBox>
        <Title>Portfolio Details</Title>
        <StatItem>
          <Label>
            LSD Networks:{' '}
            <HoverCard text="The total number of LSD networks your Fees and MEV deposits are staked in." />
          </Label>
          <span>{numberOflsdNetworks}</span>
        </StatItem>
        <StatItem>
          <Label>
            Validators:{' '}
            <HoverCard text="The number of validators your deposited ETH has been staked in." />
          </Label>
          <span>{numberOfKnots}</span>
        </StatItem>
        <StatItem>
          <Label>
            Payoff Rate:{' '}
            <HoverCard text="The current SLOT balance in the house / dETH minted in the house. This rate portrays how much SLOT is necessary to exit Stakehouse." />
          </Label>
          <span className="text-primary">1.00%</span>
        </StatItem>
      </StatBox>
    </div>
  )
}

const Title = tw.div`text-grey700`
const Label = tw.div`flex items-center gap-2`
const StatItem = tw.div`flex justify-between items-center`
const StatBox = tw.div`flex flex-col bg-grey200 px-8 py-6 rounded-2xl bg-opacity-50 gap-2 justify-center`

const TotalETH = styled.div`
  ${tw`text-primary font-bold mt-2`}
  font-size: 40px;

  span {
    ${tw`text-2xl`}
  }
`

export default Stats
