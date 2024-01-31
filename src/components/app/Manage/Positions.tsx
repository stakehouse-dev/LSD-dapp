import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ReactComponent as DEthIcon } from '@/assets/images/icon-deth.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { ReactComponent as RageQuitIcon } from '@/assets/images/unstaked-withdraw-icon.svg'
import { WITHDRAW_MODE } from '@/constants'

import { Tooltip } from '../../shared'

const position = {
  label: 'Staked ETH Portfolio',
  subPositions: [
    {
      label: 'Protected Staking',
      ref: 'stakedStakingAmount',
      mode: WITHDRAW_MODE.STAKING,
      icon: <DEthIcon />
      //href: '/manage/protected-staking'
    },
    {
      label: 'MEV Staking LP',
      ref: 'stakedFeesAmount',
      mode: WITHDRAW_MODE.FEES_MEV
      //href: '/manage/fees-mev'
    },
    {
      label: 'Node Operator',
      ref: 'stakedNodeAmount',
      mode: WITHDRAW_MODE.NODE_OPERATOR
      //href: '/manage/node-operator'
    }
  ]
}

const unstakedPosition = {
  label: 'Deposited ETH',
  subPositions: [
    {
      label: 'Protected Staking',
      ref: 'noStakedStakingAmount',
      mode: WITHDRAW_MODE.STAKING,
      icon: <DEthIcon />
    },
    { label: 'MEV Staking', ref: 'noStakedFeesAmount', mode: WITHDRAW_MODE.FEES_MEV },
    { label: 'Node Operator', ref: 'noStakedNodeAmount', mode: WITHDRAW_MODE.NODE_OPERATOR }
  ]
}

const StatSubItem: FC<{
  label: string
  icon: ReactNode | undefined
  href?: string
  amount: number
}> = ({ label, icon, href, amount }) => {
  const navigate = useNavigate()

  return (
    <div className="flex justify-between py-2 text-grey700">
      <span className="flex items-center gap-1">
        {icon ? icon : <EthIcon />}
        {label}
        {href && (
          <ArrowTopRightIcon tw="cursor-pointer text-primary500" onClick={() => navigate(href)} />
        )}
      </span>
      <span>
        {isNaN(Number(amount)) ? 0 : amount.toLocaleString(undefined, { maximumFractionDigits: 3 })}{' '}
        ETH
      </span>
    </div>
  )
}

interface PositionsProps {
  amountData: any
}

export const Positions = ({ amountData }: PositionsProps) => {
  const {
    noStakedStakingAmount,
    noStakedFeesAmount,
    noStakedNodeAmount,
    stakedStakingAmount,
    stakedFeesAmount,
    stakedNodeAmount,
    unstakedAmount
  } = amountData
  const navigate = useNavigate()
  const stakedAmount = stakedStakingAmount + stakedFeesAmount + stakedNodeAmount
  const noStakedAmount = noStakedStakingAmount + noStakedFeesAmount + noStakedNodeAmount

  return (
    <div className="w-full px-4 mt-4 text-sm font-medium">
      <div key={position.label} className="w-full flex flex-col">
        {Number(unstakedAmount) > 0 && (
          <div
            className="bg-grey900 py-3 px-5 rounded-lg flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => navigate('withdraw')}>
            <div className="flex gap-2 items-center">
              <RageQuitIcon />
              Withdraw from unstaked validator
            </div>
            <div className="flex gap-2 items-center text-primary">
              {unstakedAmount} ETH <ArrowTopRightIcon />
            </div>
          </div>
        )}
        <StatItem className="my-1">
          <div className="flex gap-2 items-center">
            {position.label}{' '}
            <Tooltip message="Your staked ETH within a validator on the consensus layer. Click the arrow for detailed information." />
          </div>
          <span>
            {isNaN(Number(stakedAmount))
              ? 0
              : Number(stakedAmount).toLocaleString(undefined, { maximumFractionDigits: 3 })}{' '}
            ETH
          </span>
        </StatItem>
        <div className="">
          {position.subPositions.map((subItem, index) => (
            <StatSubItem
              key={index}
              label={subItem.label}
              icon={subItem.icon}
              //href={subItem.href}
              amount={amountData[subItem.ref]}
            />
          ))}
        </div>
      </div>

      <div key={unstakedPosition.label} className="w-full flex flex-col">
        <StatItem className="my-1">
          <div className="flex gap-2 items-center">
            {unstakedPosition.label}
            <Tooltip message="ETH waiting to be matched with a node operator or liquidity providers." />
          </div>
          <span>
            {isNaN(Number(noStakedAmount))
              ? 0
              : Number(noStakedAmount).toLocaleString(undefined, { maximumFractionDigits: 3 })}{' '}
            ETH
          </span>
        </StatItem>
        <div className="">
          {unstakedPosition.subPositions.map((subItem, index) => (
            <StatSubItem
              key={index}
              label={subItem.label}
              icon={subItem.icon}
              amount={amountData[subItem.ref]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const StatItem = tw.div`flex justify-between py-2`
