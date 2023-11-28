import { Dialog } from '@headlessui/react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as BlueAlertIcon } from '@/assets/images/icon-alert-blue.svg'
import { Button, Modal } from '@/components/shared'

import styles from './styles.module.scss'

interface ModalConfirmStakeProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ModalConfirmStake = ({ open, onClose, onConfirm }: ModalConfirmStakeProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <h3 className={styles.confirmPasswordHeader}>Batch Stake</h3>
          <p className={styles.confirmPasswordDesc}>
            Batch staking is available only to validators that use the same password.
          </p>
          <p className={styles.confirmPasswordDesc}>
            Selecting validators with different password will freeze the batch staking process.
          </p>
          <p className={styles.confirmPasswordDesc}>
            Please check Giant pool balance before staking. Transaction might fail if the pools have
            insufficient balance.
          </p>
          <Button variant="primary" className="w-80 h-12" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
