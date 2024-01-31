import { useQuery } from '@apollo/client'
import { Dialog } from '@headlessui/react'
import { ethers } from 'ethers'
import { FC, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBalance } from 'wagmi'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as BlueAlertIcon } from '@/assets/images/icon-alert-blue.svg'
import { ReactComponent as RedAlertIcon } from '@/assets/images/icon-alert-red.svg'
import { ReactComponent as BlueEthIcon } from '@/assets/images/icon-eth-bigs.svg'
import { Button, Modal, Spinner } from '@/components/shared'
import { config } from '@/constants/environment'
import { BlockswapSDKContext } from '@/context/BlockswapSDKContext'
import { NodeRunnerStakehouseAddressQuery } from '@/graphql/queries/NodeRunnersQuery'
import { useCustomAccount, useMakeRealTxHash, useNetworkBasedLinkFactories } from '@/hooks'
import { notifyHash } from '@/utils/global'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  onClose: () => void
  validator: string
}

const ModalEtherCurate: FC<IProps> = ({ open, onClose, validator }) => {
  const { sdk } = useContext(BlockswapSDKContext)
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { account } = useCustomAccount()
  const { data: { lsdvalidator } = {} } = useQuery(NodeRunnerStakehouseAddressQuery, {
    variables: { address: validator },
    skip: !validator
  })

  const [isSubmitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [eligibleToCurate, setEligibleToCurate] = useState(true)
  const [txHash, setTxHash] = useState('')
  const { hash } = useMakeRealTxHash(txHash)

  const { data: { formatted: availableAmount } = {}, refetch } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    token: config.dethTokenAddress as `0x${string}`,
    chainId: config.networkId
  })

  useEffect(() => {
    const checkEligibleToCurate = async () => {
      if (validator && sdk) {
        setChecking(true)
        try {
          const requiredDETH = await sdk.utils.dETHRequiredForIsolation(validator)
          setEligibleToCurate(
            Number(availableAmount) > Number(ethers.utils.formatEther(requiredDETH))
          )
        } catch (err) {
          console.log('checkEligibleToCurate error', err)
          setEligibleToCurate(false)
        }
        setChecking(false)
      }
    }
    checkEligibleToCurate()
  }, [sdk, validator, availableAmount, open])

  const handleConfirm = useCallback(async () => {
    if (open && account && sdk && lsdvalidator && validator) {
      try {
        setSubmitting(true)
        let knotData = await sdk.wizard.getCumulativeValidatorIndexes(
          account?.address?.toLowerCase() || ''
        )
        if (knotData.length === 0 || (knotData.length === 1 && knotData[0].id === '0')) {
          const tx = await sdk.createIndex(account?.address?.toLowerCase() || '')
          notifyHash(tx.hash)
          await tx.wait(1)
          knotData = await sdk.wizard.getCumulativeValidatorIndexes(
            account?.address?.toLowerCase() || ''
          )
        }
        const knotIndex = knotData[0].id
        const stakehouseAddress =
          lsdvalidator.smartWallet.liquidStakingNetwork.stakehouseAddress ?? ''
        const tx = await sdk.depositAndIsolateKnotIntoIndex(stakehouseAddress, validator, knotIndex)
        setTxHash(tx.hash)
        notifyHash(tx.hash)
        await tx.wait()
      } catch (err) {
        console.log('handleConfirm error: ', err)
        setTxHash('')
      }
      setSubmitting(false)
    }
  }, [open, account, sdk, lsdvalidator, validator])

  const handleClose = () => {
    setChecking(false)
    setEligibleToCurate(true)
    setSubmitting(false)
    setTxHash('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Dialog.Panel className={styles.modalLayout}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={handleClose}>
          <CloseCircleIcon />
        </div>
        {checking ? null : !eligibleToCurate ? (
          <div className={styles.confirmPassword}>
            <RedAlertIcon />
            <h3 className={styles.modalTitle}>Oooops.</h3>
            <div className="text-grey700 text-sm">
              You do not have enough dETH to perform the curation.
            </div>
            <Button variant="primary" className="w-32" onClick={onClose}>
              Try Again
            </Button>
          </div>
        ) : isSubmitting ? (
          <div className={styles.confirmPassword}>
            <Spinner />
            <h3 className={styles.modalTitle}>Syncing your balance...</h3>
          </div>
        ) : txHash ? (
          <div className={styles.confirmPassword}>
            <BlueEthIcon />
            <h3 className={styles.confirmPasswordHeader}>Success</h3>
            <div className="text-grey700 text-sm">
              You have successfully synced with your token balance with the consensus layer
            </div>
            <div className="flex items-center gap-3">
              <a href={makeEtherscanLink(hash)} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="w-40">
                  Etherscan
                </Button>
              </a>
              <Link to="/">
                <Button variant="primary" className="w-40">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.confirmPassword}>
            <BlueAlertIcon />
            <h3 className={styles.modalTitle}>savETH Curation</h3>
            <div className="text-grey700 text-sm">Curate the savETH to your own index</div>
            <Button variant="primary" className="w-40" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        )}
      </Dialog.Panel>
    </Modal>
  )
}

export default ModalEtherCurate
