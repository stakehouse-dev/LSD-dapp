import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as VerticalThreeDotIcon } from '@/assets/images/icon-dot-three-vertical.svg'
import { ReactComponent as ByeOutlineIcon } from '@/assets/images/icon-park-outline_bye.svg'
import { Dropdown, ErrorModal } from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { LSD_STATUS } from '@/constants/lsdStatus'
import { useSDK } from '@/hooks'
import { TMenu } from '@/types'

import { ModalConfirmExit } from '../Modals'

interface ActionBtnProps {
  status: string
  blsKey: string
  isExitable: boolean
  order: number
}

export const ActionBtn = ({ status, isExitable, blsKey, order }: ActionBtnProps) => {
  const navigate = useNavigate()
  const { sdk } = useSDK()

  const [openExitConfirmModal, setOpenExitConfirmModal] = useState(false)
  const [openExitErrorModal, setOpenExitOpenModal] = useState(false)

  const handleOpenExitConfirmModal = () => setOpenExitConfirmModal(true)
  const handleCloseExitConfirmModal = () => setOpenExitConfirmModal(false)

  const rageQuitedValidators: string[] = useMemo(() => {
    const stringValue = localStorage.getItem('ragequit')
    if (stringValue) {
      return JSON.parse(stringValue) as string[]
    }

    return []
  }, [])

  const exitedValidators: string[] = useMemo(() => {
    const stringValue = localStorage.getItem('exitedValidators')
    if (stringValue) {
      return JSON.parse(stringValue) as string[]
    }

    return []
  }, [])

  const options: TMenu[] = useMemo(() => {
    if ([LSD_STATUS.DERIVATIVES_MINTED, LSD_STATUS.RAGE_QUIT].includes(status)) {
      return [
        {
          id: 0,
          label: 'Exit',
          icon: <ByeOutlineIcon />,
          onClick: async () => {
            let isExited = false

            if (!exitedValidators.includes(blsKey)) {
              const finalisedEpochReport = await sdk?.balanceReport.getFinalisedEpochReport(
                BEACON_NODE_URL,
                blsKey
              )
              const { currentCheckpointEpoch, exitEpoch } = finalisedEpochReport

              isExited =
                Number(exitEpoch) < Number(currentCheckpointEpoch) &&
                exitEpoch != '18446744073709551615'

              if (isExited)
                localStorage.setItem(
                  'exitedValidators',
                  JSON.stringify([...exitedValidators, blsKey])
                )
            } else {
              isExited = true
            }

            if (status === LSD_STATUS.RAGE_QUIT || isExited) {
              return navigate(`/ragequit/${blsKey}`)
            }

            if (!isExitable) {
              setOpenExitOpenModal(true)
            } else if (rageQuitedValidators.includes(blsKey)) {
              navigate(`/withdrawal/${blsKey}/status`)
            } else {
              handleOpenExitConfirmModal()
            }
          }
        }
      ]
    }

    return []
  }, [status, rageQuitedValidators])

  const handleConfirmWithdrawal = () => {
    handleCloseExitConfirmModal()
    navigate(`/withdrawal/${blsKey}`)
  }

  return (
    <>
      <Dropdown options={options} order={order}>
        <div
          className={`${
            options.length === 0
              ? 'opacity-50 cursor-not-allowed p-2 rounded-full transition-all'
              : 'cursor-pointer p-2 rounded-full transition-all'
          }`}>
          <VerticalThreeDotIcon />
        </div>
        <ModalConfirmExit
          open={openExitConfirmModal}
          onClose={handleCloseExitConfirmModal}
          onConfirm={handleConfirmWithdrawal}
        />
        <ErrorModal
          open={openExitErrorModal}
          onClose={() => setOpenExitOpenModal(false)}
          title="Error"
          message="You need to claim your node operator rewards in My rewards section before exiting."
          actionButtonContent="Confirm"
          onAction={() => setOpenExitOpenModal(false)}
        />
      </Dropdown>
    </>
  )
}
