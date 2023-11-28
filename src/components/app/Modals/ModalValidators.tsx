import { FC } from 'react'

import { ReactComponent as CloseIcon } from '@/assets/images/close-icon.svg'
import { Modal, Tooltip } from '@/components/shared'
import { IBlsKeyOption } from '@/hooks'
import { humanReadableAddress } from '@/utils/global'

interface IProps {
  open: boolean
  onClose: () => void
  validators: IBlsKeyOption[]
  setActiveKey: (key: string) => void
}

const ModalValidators: FC<IProps> = ({ open, onClose, validators, setActiveKey }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-md transform overflow-hidden text-white rounded-2xl py-6 bg-black flex flex-col items-center align-middle transition-all">
        <div className="absolute top-6 right-6 cursor-pointer" onClick={onClose}>
          <CloseIcon />
        </div>
        <div className="w-full px-10 text-left text-lg font-semibold">Select Validator</div>
        <div className="w-full px-9 mt-6 pb-8 border-b border-grey500">
          <input
            className="w-full h-full px-4 py-3 bg-black text-base rounded-lg border border-solid border-grey500 text-grey25 outline-none"
            placeholder="Search Validator"
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between text-xs pt-3 px-10 pb-2 text-grey300">
            <span>Validator</span>
            <span className="flex gap-1 items-center">
              ETH Available <Tooltip message="Available ETH balance to withdraw" />
            </span>
          </div>
          {validators.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setActiveKey(item.blsKey)
                onClose()
              }}
              className="flex px-10 justify-between py-3 cursor-pointer hover:text-primary hover:bg-grey800">
              <span>{humanReadableAddress(item.blsKey, 4)}</span>
              <span>
                {Number(item.balance).toLocaleString(undefined, {
                  maximumFractionDigits: 3
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default ModalValidators
