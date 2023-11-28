import { Dialog } from '@headlessui/react'
import { ethers } from 'ethers'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as BlueAlertIcon } from '@/assets/images/icon-alert-blue.svg'
import { Modal } from '@/components/shared'
import { EligibleValidator } from '@/types'
import { bigToNum, humanReadableAddress, roundNumber } from '@/utils/global'

import styles from './styles.module.scss'

interface ModalRedeemETHProps {
  open: boolean
  validators: EligibleValidator[]
  onClose: () => void
}

export const ModalRedeemETH = ({ open, validators, onClose }: ModalRedeemETHProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className={styles.confirmPassword}>
          <BlueAlertIcon />
          <p className={styles.confirmDepositDesc}>Optimal path to receive ETH</p>
        </div>
        <div className="w-80 rounded-lg bg-grey50 max-h-80 overflow-y-auto mt-6">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-xs text-grey300">
                <th className="font-normal py-3">Validators</th>
                <th className="font-normal py-3">ETH Available</th>
              </tr>
            </thead>
            <tbody>
              {validators.map((validator) => (
                <tr
                  key={`0x${validator.beaconReport.blsPublicKey}`}
                  className={validator.selected ? 'bg-grey800' : ''}>
                  <td
                    className={
                      validator.selected
                        ? 'text-primary text-sm font-medium py-1'
                        : 'text-white text-sm font-medium py-1'
                    }>
                    {humanReadableAddress(`0x${validator.beaconReport.blsPublicKey}`)}
                  </td>
                  <td
                    className={
                      validator.selected
                        ? 'text-primary text-sm font-medium'
                        : 'text-white text-sm font-medium'
                    }>
                    {roundNumber(
                      bigToNum(ethers.BigNumber.from(validator.totalDETHRewardsReceived)),
                      3
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
