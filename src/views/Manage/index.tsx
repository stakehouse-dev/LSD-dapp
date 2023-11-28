import './index.scss'

import { FC, useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useAccount } from 'wagmi'

import AsssetDetailsSVG from '@/assets/images/asset-details.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import BlueEthIcon from '@/assets/images/icon-blue-eth.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { ReactComponent as ListCheckIcon } from '@/assets/images/icon-list-check.svg'
import { Positions, Validators } from '@/components/app/Manage'
import Rewards from '@/components/app/Rewards'
import { Button } from '@/components/shared'
import { RewardsContext } from '@/context/RewardsContext'
import {
  useFetchLsdValidators,
  useLPTokensQuery,
  useStakedBalance,
  useWithdrawBalance
} from '@/hooks'

import { ModalWalletConnect } from '../../components/app'
import { WITHDRAW_MODE } from '../../constants'
import { roundNumber } from '../../utils/global'

enum TAB {
  POSITION = 'staked',
  REWARDS = 'rewards',
  VALIDATORS = 'validators'
}

const _stats = [
  { label: 'Staked Position', value: '--', tab: TAB.POSITION },
  { label: 'dETH and Rewards', value: '--', tab: TAB.REWARDS },
  { label: 'My Validators', value: '--', tab: TAB.VALIDATORS }
]

const Manage: FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<TAB>((params.activeTab as TAB) ?? TAB.POSITION)

  const { validators } = useFetchLsdValidators()
  const { amount: noStakedNodeAmount } = useLPTokensQuery('NOT_STAKED', '')
  const { amount: stakedStakingAmount } = useLPTokensQuery('STAKED', 'PROTECTED_STAKING_LP')
  const { amount: stakedFeesAmount } = useLPTokensQuery('STAKED', 'FEES_AND_MEV_LP')
  const { amount: stakedNodeAmount } = useLPTokensQuery('STAKED', '')
  const { balance: noStakedGiantStakingAmount } = useWithdrawBalance(
    validators.length > 0,
    WITHDRAW_MODE.STAKING
  )
  const { balance: stakedGiantStakingAmount } = useStakedBalance(WITHDRAW_MODE.STAKING)
  const { balance: noStakedGiantFeesAmount } = useWithdrawBalance(
    validators.length > 0,
    WITHDRAW_MODE.FEES_MEV
  )
  const { balance: stakedGiantFeesAmount } = useStakedBalance(WITHDRAW_MODE.FEES_MEV)
  const { balance: unstakedAmount } = useWithdrawBalance(
    validators.length > 0,
    WITHDRAW_MODE.UNSTAKED_VALIDATOR
  )

  const { balance: rewardBalance } = useContext(RewardsContext)

  const [openWalletModal, setOpenWalletModal] = useState(false)

  const handleOpenWalletModal = () => {
    setOpenWalletModal(true)
  }
  const handleCloseWalletModal = () => {
    setOpenWalletModal(false)
  }

  const stats = isConnected
    ? [
        {
          label: 'Staked Position',
          value: `${roundNumber(
            stakedStakingAmount +
              stakedFeesAmount +
              stakedNodeAmount +
              parseFloat(stakedGiantStakingAmount) +
              parseFloat(stakedGiantFeesAmount),
            3
          )} ETH`,
          tab: TAB.POSITION
        },
        {
          label: 'My Rewards',
          value: `${roundNumber(rewardBalance, 3)} ETH`,
          tab: TAB.REWARDS
        },
        {
          label: 'My Validators',
          value: `${validators.length}`,
          tab: TAB.VALIDATORS
        }
      ]
    : _stats

  const amountData = {
    noStakedStakingAmount: parseFloat(noStakedGiantStakingAmount),
    noStakedFeesAmount: parseFloat(noStakedGiantFeesAmount),
    noStakedNodeAmount,
    stakedStakingAmount: stakedStakingAmount + parseFloat(stakedGiantStakingAmount),
    stakedFeesAmount: stakedFeesAmount + parseFloat(stakedGiantFeesAmount),
    stakedNodeAmount,
    unstakedAmount
  }

  return (
    <div className="manage">
      <div className="content">
        <div className="w-full text-center text-4xl font-semibold">Manage your Assets</div>

        <div className="content__box">
          <div className="content__box__stats">
            {stats.map((item, index) => (
              <TabItem
                isActive={activeTab === item.tab && isConnected}
                key={index}
                onClick={() => {
                  navigate('/manage')
                  setActiveTab(item.tab)
                }}>
                <div>{item.label}</div>
                <div
                  className={`${
                    activeTab === item.tab && isConnected && 'font-semibold text-base'
                  }`}>
                  {item.value}
                </div>
              </TabItem>
            ))}
          </div>
          {isConnected && activeTab === TAB.POSITION && <Positions amountData={amountData} />}
          {isConnected && activeTab === TAB.REWARDS && <Rewards />}
          {isConnected && activeTab === TAB.VALIDATORS && <Validators />}
          {!isConnected && (
            <div className="content__box__body">
              <img src={AsssetDetailsSVG} alt="asset details" />
              <div className="text-sm font-medium">Connect a wallet to continue</div>
              <Button size="lg" onClick={handleOpenWalletModal}>
                Connect Wallet
              </Button>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2 -mt-2">
          {activeTab !== TAB.REWARDS && (
            <>
              <InlineCTA
                className={isConnected ? 'cursor-pointer' : 'text-grey600 cursor-not-allowed'}
                onClick={() => navigate('/manage/activity')}>
                <Label>
                  <ListCheckIcon />
                  Check your Activity and Txs
                </Label>
                <ArrowTopRightIcon />
              </InlineCTA>
              <InlineCTA
                className={isConnected ? 'cursor-pointer' : 'text-grey600 cursor-not-allowed'}
                onClick={() => navigate('/manage/withdraw')}>
                <Label>
                  <EthIcon />
                  Withdraw unstaked ETH and lose future rewards
                </Label>
                <ArrowTopRightIcon />
              </InlineCTA>
            </>
          )}
          <InlineCTA
            className={isConnected ? 'cursor-pointer' : 'text-grey600 cursor-not-allowed'}
            onClick={() => navigate('/manage/redeem')}>
            <Label>
              <img src={BlueEthIcon} alt="blueEthIcon" />
              Redeem dETH to ETH
            </Label>
            <ArrowTopRightIcon />
          </InlineCTA>
        </div>
      </div>
      <ModalWalletConnect open={openWalletModal} onClose={handleCloseWalletModal} />
    </div>
  )
}

const InlineCTA = tw.div`flex justify-between items-center text-sm font-medium bg-[#202024] rounded-2xl py-4 px-8`
const Label = tw.span`flex items-center gap-2`
const TabItem = styled.div<{ isActive: boolean }>`
  ${tw`flex-1 flex flex-col items-center py-2 rounded-lg cursor-pointer`}
  ${(props) => props.isActive && tw`bg-[#202024] text-primary`}
`
const Message = styled.div`
  ${tw`text-white text-xs mt-4`}
  max-width: 361px;
`
export default Manage
