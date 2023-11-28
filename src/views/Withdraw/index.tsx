import './index.scss'

import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { WithdrawMode } from '@/components/app/Withdraw'
import { WITHDRAW_MODE } from '@/constants'

const modes = [
  { label: 'Protected Staking', mode: WITHDRAW_MODE.STAKING },
  { label: 'MEV Staking', mode: WITHDRAW_MODE.FEES_MEV },
  { label: 'Node Operators', mode: WITHDRAW_MODE.NODE_OPERATOR },
  { label: 'From unstaked validator', mode: WITHDRAW_MODE.UNSTAKED_VALIDATOR }
]

const Withdraw: FC = () => {
  const navigate = useNavigate()

  const { isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected) navigate('/')
  }, [isConnected])

  const handleBack = () => {
    navigate('/manage')
  }

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [activeMode, setActiveMode] = useState<WITHDRAW_MODE | null>(null)

  const handleOpen = (mode: WITHDRAW_MODE) => {
    if (activeMode === mode) setIsOpen(!isOpen)
    else {
      setIsOpen(true)
      setActiveMode(mode)
    }
  }

  return (
    <div className="withdraw">
      <div className="content">
        <div className="content__box">
          <div className="content__box__title">
            <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={handleBack} />
            Withdraw
          </div>
          <div className="flex flex-col gap-4">
            {modes.map((item, index) => {
              const isActive = item.mode === activeMode && isOpen
              return (
                <WithdrawMode
                  label={item.label}
                  key={index}
                  mode={item.mode}
                  isActive={isActive}
                  handleOpen={handleOpen}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Withdraw
