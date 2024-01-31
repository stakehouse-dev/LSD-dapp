import { useQuery } from '@apollo/client'
import { Dialog } from '@headlessui/react'
import { FC, useCallback, useContext, useEffect, useState } from 'react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as RedAlertIcon } from '@/assets/images/icon-alert-red.svg'
import { ReactComponent as BlueEthIcon } from '@/assets/images/icon-eth-bigs.svg'
import { Button, Modal, Spinner } from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { BlockswapSDKContext } from '@/context/BlockswapSDKContext'
import { LsdValidatorsQuery } from '@/graphql/queries/lsdValidators'
import { ValidatorT } from '@/types'
import { humanReadableAddress, notifyHash, noty } from '@/utils/global'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  onClose: () => void
  validator: string
}

const ModalReportBalance: FC<IProps> = ({ open, onClose, validator }) => {
  const { sdk } = useContext(BlockswapSDKContext)
  const { data: sValidators } = useQuery(LsdValidatorsQuery, {
    variables: { blsPublicKey: validator },
    skip: !validator,
    fetchPolicy: 'network-only'
  })

  const sValidator: ValidatorT = sValidators?.stakehouseAccounts
    ? sValidators?.stakehouseAccounts[0]
    : null

  const [isSubmitting, setSubmitting] = useState(false)
  const [failed, setfailed] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [upToDate, setUpToDate] = useState<Boolean>(false)

  const handleReportBalance = useCallback(async () => {
    if (sValidator && open && sdk) {
      try {
        setSubmitting(true)
        const tx = await sdk.reportBalance(
          BEACON_NODE_URL,
          sValidator.id,
          sValidator.stakeHouseMetadata?.id
        )
        if (tx.dETHReportResult !== null) {
          notifyHash(tx.dETHReportResult.hash)
          setTxHash(tx.dETHReportResult.hash)
          await tx.dETHReportResult.wait()
        } else if (tx.slashResult !== null) {
          notifyHash(tx.slashResult.hash)
          setTxHash(tx.slashResult.hash)
          await tx.slashResult.wait()
        } else {
          setUpToDate(true)
        }
      } catch (err) {
        console.log('handleReport error: ', err)
        setfailed(true)
      }
      setSubmitting(false)
    }
  }, [sValidator, sdk, open])

  // useEffect(() => {
  //   handleReportBalance()
  // }, [handleReportBalance])

  const handleClose = () => {
    setSubmitting(false)
    setfailed(false)
    setTxHash('')
    setUpToDate(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Dialog.Panel className={styles.modalLayout}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={handleClose}>
          <CloseCircleIcon />
        </div>
        {isSubmitting ? (
          <div className={styles.confirmPassword}>
            <Spinner />
            <h3 className={styles.modalTitle}>Balance Reporting...</h3>
          </div>
        ) : failed ? (
          <div className={styles.confirmPassword}>
            <RedAlertIcon />
            <h3 className={styles.modalTitle}>Something went wrong.</h3>
            <Button variant="secondary" className="w-32" onClick={handleReportBalance}>
              Please retry
            </Button>
          </div>
        ) : txHash ? (
          <div className={styles.confirmPassword}>
            <BlueEthIcon />
            <h3 className={styles.confirmPasswordHeader}>Success</h3>
            {/* <div className="flex items-center gap-3">
              <Button variant="primary" className="w-40" onClick={onClose}>
                Close
              </Button>
            </div> */}
          </div>
        ) : upToDate ? (
          <div className={styles.confirmPassword}>
            <BlueEthIcon />
            <h3 className={styles.confirmPasswordHeader}>Balance already up to date</h3>
          </div>
        ) : (
          <div className={styles.confirmPassword}>
            <h3 className={styles.confirmPasswordHeader}>
              Validator: {humanReadableAddress(validator)}
            </h3>
            <Button variant="primary" className="w-40" onClick={handleReportBalance}>
              Report Balance
            </Button>
          </div>
        )}
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalReportBalance
