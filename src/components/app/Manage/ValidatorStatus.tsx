import { useNavigate } from 'react-router-dom'

import { LSD_STATUS } from '@/constants/lsdStatus'

type ValidatorStatusProps = {
  id: string
  status: string
  isStakable: boolean
  fundsEligible: boolean
  isMintable: boolean
  directDeposit: boolean
  isExited: boolean
  isExiting: boolean
}

export const ValidatorStatus = ({
  id,
  status,
  isStakable,
  fundsEligible,
  isMintable,
  directDeposit,
  isExited,
  isExiting
}: ValidatorStatusProps) => {
  const navigate = useNavigate()
  const handleGoWithdrawStatus = () => {
    navigate(`/withdrawal/${id}/status`)
  }

  const handleGoRageQuit = () => {
    navigate(`/ragequit/${id}`)
  }

  if (isMintable) {
    return <span className="text-primary">Minting Available</span>
  }

  if (status === LSD_STATUS.UNSTAKED) {
    return <span className="text-primary">UNSTAKED</span>
  } else if (status === LSD_STATUS.RAGE_QUIT) {
    return (
      <p
        className="py-0.5 px-2 rounded-full bg-grey750 text-white text-sm cursor-pointer"
        onClick={handleGoRageQuit}>
        RAGE QUIT
      </p>
    )
  }

  if (isExited) {
    return (
      <p
        className="py-0.5 px-2 rounded-full bg-grey750 text-white text-sm cursor-pointer"
        onClick={handleGoRageQuit}>
        {'Exited'}
      </p>
    )
  }

  if (isExiting) {
    return (
      <p
        className="py-0.5 px-2 rounded-full bg-grey750 text-white text-sm cursor-pointer"
        onClick={handleGoWithdrawStatus}>
        {'Exiting'}
      </p>
    )
  }

  switch (status) {
    case LSD_STATUS.STAKED:
      return <span>STAKED</span>
    case LSD_STATUS.BANNED:
      return <span className="text-error">BANNED</span>
    case LSD_STATUS.DERIVATIVES_MINTED:
      return <span>MINTED</span>
    case LSD_STATUS.WAITING_FOR_ETH:
      if (fundsEligible && isStakable) {
        return directDeposit ? (
          <span className="text-yellow">FREN DELEGATION</span>
        ) : (
          <span className="text-primary">Ready to stake</span>
        )
      }
      return <span className="text-status-waiting">Waiting for ETH</span>
    case LSD_STATUS.READY_TO_STAKE:
      return directDeposit ? (
        <span className="text-yellow">FREN DELEGATION</span>
      ) : (
        <span className="text-primary">Ready to stake</span>
      )
  }

  return <></>
}
