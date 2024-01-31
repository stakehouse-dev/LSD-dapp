import './index.scss'

import { FC, useState } from 'react'
import { useAccount } from 'wagmi'

import FeesCheckIcon from '@/assets/images/icon-check-fees.svg'
import NodeIcon from '@/assets/images/icon-node.svg'
import { DepositFooter } from '@/components/app/Deposit/Footer'
import { ModalWalletConnect } from '@/components/app/Modals'
import { Button } from '@/components/shared'

const RunNode: FC = () => {
  const { isConnected } = useAccount()
  const [openWalletModal, setOpenWalletModal] = useState(false)

  const handleOpenWalletModal = () => {
    setOpenWalletModal(true)
  }
  const handleCloseWalletModal = () => {
    setOpenWalletModal(false)
  }

  return (
    <div className="deposit">
      <div className="content">
        <div className="w-full text-center text-4xl font-semibold">
          How would you like to stake?
        </div>
        <div className="earning">
          <div className="flex gap-2 max-w-xl w-full">
            <div className="flex-1 flex flex-col">
              <img src={NodeIcon} alt="icon" className="mx-auto mb-6" />
              <div className="earning__mode first">
                <div className="earning__mode__title">For Free</div>
                <div className="earning__mode__item">
                  <img src={FeesCheckIcon} alt="icon" /> No minimum
                </div>
                <div className="earning__mode__item">
                  <img src={FeesCheckIcon} alt="icon" />
                  Earn Fees and MEV paid in ETH
                </div>
              </div>
              {isConnected && (
                <div className="earning__deposit">
                  <Button variant="secondary" className="stake-deposit" size="lg">
                    Unlock this
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <img src={NodeIcon} alt="icon" className="mx-auto mb-6" />
              <div className="earning__mode">
                <div className="earning__mode__title">4 ETH</div>
                <div className="earning__mode__item">
                  <img src={FeesCheckIcon} alt="icon" />4 ETH minimum
                </div>
                <div className="earning__mode__item">
                  <img src={FeesCheckIcon} alt="icon" />
                  Earn Fees and MEV paid in ETH
                </div>
              </div>
              {isConnected && (
                <div className="earning__deposit">
                  <Button className="node-deposit" size="lg">
                    Start Node
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
    </div>
  )
}
export default RunNode
