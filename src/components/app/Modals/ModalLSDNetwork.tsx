import { FC, useState } from 'react'

import { ReactComponent as CloseIcon } from '@/assets/images/close-icon.svg'
import { Modal, Tooltip } from '@/components/shared'
import { ILSDNetworkOption } from '@/hooks'

interface IProps {
  open: boolean
  onClose: () => void
  networks: ILSDNetworkOption
  setActiveNetwork: (networkId: string) => void
}

const ModalLSDNetwork: FC<IProps> = ({ open, networks, onClose, setActiveNetwork }) => {
  const [query, setQuery] = useState<string>('')

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-md transform overflow-hidden text-white rounded-2xl py-6 bg-black flex flex-col items-center align-middle transition-all">
        <div className="absolute top-6 right-6 cursor-pointer" onClick={onClose}>
          <CloseIcon />
        </div>
        <div className="w-full px-10 text-left text-lg font-semibold">Select LSD Network</div>
        <div className="w-full px-9 mt-6 pb-8 border-b border-grey500">
          <input
            className="w-full h-full px-4 py-3 bg-black text-base rounded-lg border border-solid border-grey500 text-grey25 outline-none"
            placeholder="Search LSD Network"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between text-xs pt-3 px-10 pb-2 text-grey300">
            <span>LSD Network</span>
            <span className="flex gap-1 items-center">
              ETH Available <Tooltip message="Available ETH balance to withdraw" />
            </span>
          </div>
          {Object.keys(networks)
            .filter((id) => networks[id].ticker.toLowerCase().includes(query.toLowerCase()))
            .map((id, index) => (
              <div
                key={index}
                onClick={() => {
                  setActiveNetwork(id)
                  onClose()
                }}
                className="flex px-10 justify-between py-3 cursor-pointer hover:text-primary hover:bg-grey800">
                <span>{networks[id].ticker}</span>
                <span>
                  {Number(networks[id].balance).toLocaleString(undefined, {
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

export default ModalLSDNetwork
