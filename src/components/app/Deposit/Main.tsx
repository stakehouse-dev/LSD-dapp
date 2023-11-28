import './Main.scss'

import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import AlertCircleIcon from '@/assets/images/alert-circle-no-bg.svg'
import ArrowRight from '@/assets/images/arrow-right.svg'
import FeesCheckIcon from '@/assets/images/icon-check-fees.svg'
import NodeCheckIcon from '@/assets/images/icon-check-node.svg'
import StakeCheckIcon from '@/assets/images/icon-check-stake.svg'
import FeesIcon from '@/assets/images/icon-fees.svg'
import NodeIcon from '@/assets/images/icon-node.svg'
import StakeIcon from '@/assets/images/icon-stake.svg'
import { ModalWalletConnect } from '@/components/app/Modals'
import { Button } from '@/components/shared'
import { DEPOSIT_MODE } from '@/constants'
import { useCustomAccount } from '@/hooks'

import { DepositFooter } from './Footer'

type MainProps = {
  handleModeChange: (mode: DEPOSIT_MODE) => void
}

export const Main: FC<MainProps> = ({ handleModeChange }) => {
  const { isConnected } = useAccount()
  const { account } = useCustomAccount()
  const address = account?.address
  const navigate = useNavigate()

  const [openWalletModal, setOpenWalletModal] = useState(false)

  const handleOpenWalletModal = () => {
    setOpenWalletModal(true)
  }
  const handleCloseWalletModal = () => {
    setOpenWalletModal(false)
  }

  const handleGoValidators = () => {
    navigate(`/manage/validators/1`)
  }

  return (
    <div className="content">
      <div className=" relative p-4 bg-red500 rounded-xl gap-1 flex flex-col items-center mb-6">
        <div className="text-sm text-red400 font-semibold flex items-center gap-1">
          <img src={AlertCircleIcon} alt="icon" />
          If you have staked as a node operator
        </div>
        <span className="text-sm text-red400 mb-2 w-446 text-center">
          {
            "Make sure you have set your LSD Network's fee recipient address or else you may lose ETH or your validator."
          }
        </span>
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoValidators}>
          <span className="text-sm font-semibold text-red400">Add Now</span>
          <img src={ArrowRight} alt="icon" />
        </div>
      </div>
      <div className="w-full text-center text-4xl font-semibold">How would you like to stake?</div>
      <div className="earning">
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col">
            <img src={StakeIcon} alt="icon" className="mx-auto mb-6" />
            <div className="earning__mode first">
              <div className="earning__mode__title">Protected Staking</div>
              <div className="earning__mode__item">
                <img src={StakeCheckIcon} alt="icon" />
                Earn 33% more staking rewards than traditional validator staking
              </div>
              <div className="earning__mode__item">
                <img src={StakeCheckIcon} alt="icon" />
                No minimum
              </div>
            </div>
            {isConnected && (
              <div className="earning__deposit">
                <Button
                  className="stake-deposit"
                  size="lg"
                  onClick={() => handleModeChange(DEPOSIT_MODE.STAKING)}>
                  Deposit
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <img src={FeesIcon} alt="icon" className="mx-auto mb-6" />
            <div className="earning__mode w-76">
              <div className="earning__mode__title">MEV Staking</div>
              <div className="earning__mode__item">
                <img src={FeesCheckIcon} alt="icon" />
                Earn Fees and MEV paid in ETH
              </div>
              <div className="earning__mode__item">
                <img src={FeesCheckIcon} alt="icon" />
                No minimum
              </div>
            </div>
            {isConnected && (
              <div className="earning__deposit">
                <Button
                  className="fees-deposit"
                  size="lg"
                  onClick={() => handleModeChange(DEPOSIT_MODE.FEES_MEV)}>
                  Deposit
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <img src={NodeIcon} alt="icon" className="mx-auto mb-6" />
            <div className="earning__mode last">
              <div className="earning__mode__title">Node Operator</div>
              <div className="earning__mode__item">
                <img src={NodeCheckIcon} alt="icon" />
                Requires 4 ETH
              </div>
              <div className="earning__mode__item">
                <img src={NodeCheckIcon} alt="icon" />
                Earn fees and MEV paid in ETH
              </div>
            </div>
            {isConnected && (
              <div className="earning__deposit">
                <Button
                  className="node-deposit"
                  size="lg"
                  onClick={() => handleModeChange(DEPOSIT_MODE.NODE_OPERATOR)}>
                  Deposit
                </Button>
              </div>
            )}
          </div>
        </div>
        {!isConnected && (
          <Button size="lg" className="mx-auto" onClick={handleOpenWalletModal}>
            Connect wallet
          </Button>
        )}
      </div>
      {!isConnected && <div className="content__comment">Connect a wallet to continue</div>}
      {isConnected && <DepositFooter />}
      <ModalWalletConnect open={openWalletModal} onClose={handleCloseWalletModal} />
    </div>
  )
}
