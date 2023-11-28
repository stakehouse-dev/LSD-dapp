import { Dialog } from '@headlessui/react'
import { FC } from 'react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as RedAlertIcon } from '@/assets/images/icon-alert-red.svg'
import { Modal, Spinner } from '@/components/shared'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  approving: boolean
  failedApprove: boolean
  onClose: () => void
}

const ModalApproveMint: FC<IProps> = ({ open, approving, failedApprove, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        {approving && (
          <div className={styles.confirmDepositFailed}>
            <Spinner size={58} />
            <p className={styles.modalTitle}>{`Verifying your validator's eligibility`}</p>
          </div>
        )}
        {failedApprove && (
          <div className={styles.confirmDepositFailed}>
            <RedAlertIcon />
            <p className={styles.modalTitle}>Validator Not Eligible</p>
            <p className={styles.confirmDepositDesc}>
              Please ensure your validator is active on the <a>consensus layer</a> and has a balance
              of 32+ ETH.
            </p>
          </div>
        )}
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalApproveMint
