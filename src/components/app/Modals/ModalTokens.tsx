import { Dialog } from '@headlessui/react'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { Modal } from '@/components/shared'
import { DETH, DETH_WITHDRAW_TOKENS, TokenT } from '@/constants/tokens'
import { roundNumber } from '@/utils/global'

import styles from './styles.module.scss'

interface ModalTokensProps {
  open: boolean
  activeValidator?: any
  onSelect: (token: TokenT) => void
  onClose: () => void
}

export const ModalTokens = ({ open, activeValidator, onSelect, onClose }: ModalTokensProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Dialog.Panel className={styles.modalLayoutBig} style={{ padding: 24 }}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={onClose}>
          <CloseCircleIcon />
        </div>
        <div className="w-full text-white">
          <div className="w-full pb-3 border-b border-innerBorder flex flex-start">
            <span className="text-textBase font-semibold">Select A Token</span>
          </div>
          <div className="py-3 flex flex-col gap-2">
            {DETH_WITHDRAW_TOKENS.map((token) => (
              <div
                key={token.id}
                onClick={() => onSelect(token)}
                className="flex w-full justify-between items-center cursor-pointer rounded-md hover:bg-grey800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex justify-center items-center rounded-full bg-grey950">
                    <img src={token.icon} alt="token_icon" />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-textBase text-xl font-medium">{token.symbol}</p>
                    <span className="text-textLabel text-xs">{token.label}</span>
                  </div>
                </div>
                <p className="text-textBase">
                  {token.symbol === DETH.symbol
                    ? activeValidator
                      ? roundNumber(Number(activeValidator.dethBalance), 3)
                      : 0
                    : activeValidator
                    ? roundNumber(Number(activeValidator.ethBalance), 3)
                    : 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}
