import { Dialog } from '@headlessui/react'
import { useState } from 'react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as BlueAlertIcon } from '@/assets/images/icon-alert-blue.svg'
import { Button, Checkbox, Modal, Tooltip } from '@/components/shared'

import styles from './styles.module.scss'

interface ModalFacilitateConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  borrowAvailable: boolean
  isFacilitated: boolean
}

export const ModalFacilitateConfirm = ({
  open,
  onClose,
  onConfirm,
  borrowAvailable = false,
  isFacilitated = false
}: ModalFacilitateConfirmProps) => {
  const [firstCheck, setFirstCheck] = useState(false)
  const [secondCheck, setSecondCheck] = useState(false)
  const [thirdCheck, setThirdCheck] = useState(false)

  return (
    <Modal open={open} onClose={onClose} tw="z-100">
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <h3 className={styles.confirmPasswordHeader}>Help a Validator say goodbye!</h3>
          <p className={styles.confirmDepositDesc}>
            {borrowAvailable && (
              <>
                <span className="text-sm text-grey550">
                  Warning: This validator already has dETH available in the index. <br />
                  You can proceed to help the validator exit, but you won&apos;t be able to redeem.
                  For redeeming dETH, please select another validator.
                </span>
                <br />
                <br />
              </>
            )}
            I understand that I am:
          </p>
          <div className="flex flex-col w-full gap-2 text-left">
            <div className="flex gap-3 items-center">
              <Checkbox label="" checked={firstCheck} onChange={setFirstCheck} />
              <p className="text-grey700">Finishing the exit process on behalf of the validator</p>
            </div>
            {!borrowAvailable && !isFacilitated && (
              <div className="flex gap-3 items-center">
                <Checkbox label="" checked={secondCheck} onChange={setSecondCheck} />
                <p className="text-grey700">
                  Supplying deth to facilitate a validator exit from the network
                </p>
              </div>
            )}
            {/* <div className="flex gap-3 items-center">
              <Checkbox label="" checked={thirdCheck} onChange={setThirdCheck} />
              <p className="text-grey700">Bla bla bla bla</p>
            </div> */}
          </div>
          <div className="w-full flex justify-center mt-2 items-center gap-4">
            <Button
              className="w-1/2"
              onClick={onConfirm}
              size="lg"
              disabled={!firstCheck || (!secondCheck && !borrowAvailable && !isFacilitated)}>
              Confirm
            </Button>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
