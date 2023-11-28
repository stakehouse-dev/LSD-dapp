import { useQuery } from '@apollo/client'
import { Dialog } from '@headlessui/react'
import { FC, useCallback, useContext, useEffect, useState } from 'react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as RedAlertIcon } from '@/assets/images/icon-alert-red.svg'
import { Button, Modal, Spinner } from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { BlockswapSDKContext } from '@/context/BlockswapSDKContext'
import { LsdValidatorsQuery } from '@/graphql/queries/lsdValidators'
import { useCustomAccount } from '@/hooks'
import { ValidatorT } from '@/types'
import { notifyHash, noty } from '@/utils/global'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  blsKey: string | undefined
  onClose: () => void
  onSubmitted: () => void
}

const ModalReportBalance: FC<IProps> = ({ open, blsKey, onClose, onSubmitted }) => {
  const { sdk } = useContext(BlockswapSDKContext)
  const { isGnosis } = useCustomAccount()

  const { data: sValidators } = useQuery(LsdValidatorsQuery, {
    variables: { blsPublicKey: blsKey },
    skip: !blsKey,
    fetchPolicy: 'network-only'
  })
  const validator: ValidatorT = sValidators?.stakehouseAccounts
    ? sValidators?.stakehouseAccounts[0]
    : null

  const [isSubmitting, setSubmitting] = useState(false)
  const [failed, setfailed] = useState(false)

  const handleReportBalance = useCallback(async () => {
    if (validator && open && sdk) {
      try {
        setSubmitting(true)
        const result = await sdk.reportBalance(
          BEACON_NODE_URL,
          validator.id,
          validator.stakeHouseMetadata?.id,
          0,
          true
        )
        if (result?.slashResult) {
          if (!isGnosis) notifyHash(result?.slashResult.hash)
          await result?.slashResult.wait()

          noty('Validator slashed!')
        }
        if (result?.dETHReportResult?.tx) {
          if (!isGnosis) notifyHash(result?.dETHReportResult?.tx.hash)
          await result?.dETHReportResult?.tx.wait()

          noty('Balance reported successfully')
          setSubmitting(false)
          return handleClose(true)
        } else if (!result?.slashResult) {
          noty('Balance already up to date')
        }
      } catch (err) {
        noty('Balance already up to date')
      } finally {
        setSubmitting(false)
        handleClose(false)
      }
    }
  }, [validator, open, sdk])

  useEffect(() => {
    handleReportBalance()
  }, [handleReportBalance])

  const handleClose = (submitted?: boolean) => {
    setSubmitting(false)
    if (submitted) {
      setfailed(false)
      onSubmitted()
    } else if (!failed) {
      setfailed(false)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={() => {}}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={() => {}}>
          <CloseCircleIcon />
        </div>
        {isSubmitting ? (
          <div className={styles.confirmPassword}>
            <Spinner />
            <h3 className={styles.modalTitle}>Confirmation Pending</h3>
          </div>
        ) : failed ? (
          <div className={styles.confirmPassword}>
            <RedAlertIcon />
            <h3 className={styles.modalTitle}>Something went wrong.</h3>
            <Button variant="secondary" className="w-32" onClick={handleReportBalance}>
              Please retry
            </Button>
          </div>
        ) : (
          <div className={styles.confirmPassword}>
            <Spinner />
            <h3 className={styles.modalTitle}>Confirmation Pending</h3>
          </div>
        )}
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalReportBalance
