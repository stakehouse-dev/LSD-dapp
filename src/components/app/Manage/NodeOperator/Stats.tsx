import { FC, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ReactComponent as DEthIcon } from '@/assets/images/icon-deth.svg'
import { ReactComponent as DEthIcon2 } from '@/assets/images/icon-deth2.svg'
import { HoverCard } from '@/components/shared'
import { RewardsContext } from '@/context/RewardsContext'
import { usePortfolioNodeOperator } from '@/hooks'
import { roundNumber } from '@/utils/global'

const Stats: FC = () => {
  const navigate = useNavigate()
  const { payouts, numberOfKnots, numberOflsdNetworks, validator_slot } = usePortfolioNodeOperator()
  const { rewards, balance: TotalBalance } = useContext(RewardsContext)

  const totalNodeOperatorAmount = useMemo(() => {
    if (rewards && TotalBalance) {
      return TotalBalance - rewards.staking - rewards.feesMev
    }

    return 0
  }, [rewards, TotalBalance])

  const totalSlot = useMemo(
    () =>
      Object.keys(validator_slot).reduce(
        (sum: number, current: string) => sum + validator_slot[current],
        0
      ),
    [validator_slot]
  )

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 border border-solid border-innerBorder rounded-2xl px-8 py-6 gap-4 text-sm font-medium mb-8">
      <div className="flex flex-col bg-grey200 px-8 py-6 rounded-2xl gap-2 justify-center">
        <Title>Total Rewards Claimed</Title>
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
            onClick={() => navigate('/manage/rewards/node_operator')}>
            {roundNumber(totalNodeOperatorAmount, 3)} ETH <ArrowTopRightIcon />
          </span>
        </StatItem>
      </div>
      <StatBox>
        <Title>My Stake</Title>
        <StatItem>
          <Label>
            {' '}
            <DEthIcon2 />
            Total SLOT
          </Label>
          <span>{roundNumber(totalSlot, 3)}</span>
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
