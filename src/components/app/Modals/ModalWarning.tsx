import { Dialog } from '@headlessui/react'
import { FC } from 'react'

import AccountAvatar from '@/assets/images/account-avatar.svg'
import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import LogoutIcon from '@/assets/images/logout.svg'
import { Button, Modal } from '@/components/shared'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  onClose: () => void
}

const ModalWarning: FC<IProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className="text-white">
          Starting January 15, 2024 the Goerli dApp and functionalities will be depreciated. This is
          in coordination with the ecosystem wide sunset of Goerli. The contracts will remain but
          the UI will no longer be available.
        </div>

        <div className="mt-8">
          <Button variant="secondary" onClick={onClose}>
            <div className="flex items-center px-4 gap-2 text-white">Close</div>
          </Button>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalWarning
