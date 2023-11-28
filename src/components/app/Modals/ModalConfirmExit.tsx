import { Dialog } from '@headlessui/react'
import { useState } from 'react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as BlueAlertIcon } from '@/assets/images/icon-alert-blue.svg'
import { Button, Checkbox, Modal } from '@/components/shared'

import styles from './styles.module.scss'

interface ModalConfirmExitProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ModalConfirmExit = ({ open, onClose, onConfirm }: ModalConfirmExitProps) => {
  const [firstCheck, setFirstCheck] = useState(false)
  const [secondCheck, setSecondCheck] = useState(false)

  return (
    <Modal open={open} onClose={onClose} tw="z-100">
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <h3 className={styles.confirmPasswordHeader}>Exit your validator</h3>
          <p className={styles.confirmDepositDesc}>
            {`I understand that before exiting my validator I'm`}
            <br /> fully aware of this implications:
          </p>
          <div className="flex flex-col w-full gap-2 text-left">
            <div className="flex gap-3 items-center">
              <Checkbox label="" checked={firstCheck} onChange={setFirstCheck} />
              <p className="text-grey300">The process is irreversible</p>
            </div>
            <div className="flex gap-3 items-center">
              <Checkbox label="" checked={secondCheck} onChange={setSecondCheck} />
              <p className="text-grey300">
                I must continue operating my node and validator during the waiting window
              </p>
            </div>
          </div>
          <div className="w-full flex justify-center mt-2 items-center gap-4">
            <Button onClick={onConfirm} size="lg" disabled={!firstCheck || !secondCheck}>
              Withdraw Validator
            </Button>
            <Button variant="text-primary">
              <div className="flex gap-2 text-grey300">Learn More</div>
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
