import './index.scss'

import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { FeesMev, Main, NodeOperator, Stake } from '@/components/app/Deposit'
import { DEPOSIT_MODE } from '@/constants'

const Deposit: FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [activeMode, setActiveMode] = useState<DEPOSIT_MODE>(
    params.mode ? (params.mode as DEPOSIT_MODE) : DEPOSIT_MODE.MAIN
  )

  const { isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected) {
      setActiveMode(DEPOSIT_MODE.MAIN)
    }
  }, [isConnected])

  const handleModeChange = (mode: DEPOSIT_MODE) => setActiveMode(mode)
  const handleGoBack = () => {
    navigate('/')
    setActiveMode(DEPOSIT_MODE.MAIN)
  }

  return (
    <div className="deposit">
      {activeMode === DEPOSIT_MODE.MAIN && <Main handleModeChange={handleModeChange} />}
      {activeMode === DEPOSIT_MODE.STAKING && <Stake onBack={handleGoBack} />}
      {activeMode === DEPOSIT_MODE.FEES_MEV && <FeesMev onBack={handleGoBack} />}
      {activeMode === DEPOSIT_MODE.NODE_OPERATOR && <NodeOperator onBack={handleGoBack} />}
    </div>
  )
}
export default Deposit
