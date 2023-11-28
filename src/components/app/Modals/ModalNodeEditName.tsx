import 'twin.macro'

import { Dialog } from '@headlessui/react'
import { FC, useContext, useEffect, useState } from 'react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { Button, ClipboardCopy, HoverCard, Modal, Spinner, TextInput } from '@/components/shared'
import { BlockswapSDKContext } from '@/context/BlockswapSDKContext'
import { humanReadableAddress, notifyHash } from '@/utils/global'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  onClose: () => void
  address: string
}

const ModalNodeEditName: FC<IProps> = ({ open, onClose, address }) => {
  const { sdk } = useContext(BlockswapSDKContext)
  const [isSubmitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [isError, setIsError] = useState<boolean>(false)
  const [isLimitError, setIsLimitError] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(false)

  useEffect(() => {
    setIsLimitError(name.length > 10)
  }, [name])

  const handleConfirm = async () => {
    if (!sdk) return
    setIsChecking(true)
    const isUsed = await sdk.wizard.isLabelAlreadyTaken(name)
    setIsChecking(false)
    if (isUsed) {
      setIsError(true)
      return
    }
    setSubmitting(true)
    try {
      const tx = await sdk.wizard.setNodeRunnerLabel(name)
      notifyHash(tx.hash)
      await tx.wait()
      onClose()
    } catch (e) {
      console.log('rename error: ', e)
    }
    setSubmitting(false)
  }

  const handleClose = () => {
    setName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>

        {isSubmitting ? (
          <div className="flex flex-col gap-4 items-center">
            <Spinner />
            <h3 className={styles.modalTitle}>Confirmation Pending</h3>
          </div>
        ) : (
          <div className={styles.confirmDeposit}>
            <div className={styles.modalTitle}>Node Operator Name</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-grey300 text-sm gap-1">
                Create a custom name for this address: {humanReadableAddress(address)}
                <ClipboardCopy copyText={address} />
                <HoverCard text="This name will be associated with all of your validators in this portfolio." />
              </div>
              <TextInput
                title="Please enter a name for this index"
                tooltip="Rename index"
                className={styles.input}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setIsError(false)
                }}
              />
              {isError && (
                <div className="text-error text-left text-sm font-medium">
                  The given name is already taken.
                </div>
              )}
              {isLimitError && (
                <div className="text-error text-left text-sm font-medium">
                  Node Operator name is limited to 10 characters.
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="w-full"
                disabled={!name}
                onClick={() => setName('')}>
                Reset
              </Button>
              <Button
                variant="primary"
                disabled={!name || isChecking || isLimitError}
                className="w-full flex justify-center items-center"
                onClick={handleConfirm}>
                {isChecking ? <Spinner size={24} /> : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalNodeEditName
