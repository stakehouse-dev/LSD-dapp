import './styles.scss'

import { Menu, Transition } from '@headlessui/react'
import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { goerli, mainnet, useNetwork, useSwitchNetwork } from 'wagmi'

import { TMenu } from '@/types'

import Switch from '../Switch'

interface IProps {
  options: TMenu[]
  order?: number
}

const Dropdown: FC<PropsWithChildren<IProps>> = ({ children, options, order }) => {
  const [enabled, setEnabled] = useState(true)

  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const setNetwork = (enabled: boolean) => {
    if (switchNetwork) switchNetwork(enabled ? goerli.id : mainnet.id)
    setEnabled(enabled)
  }

  function handleOptionClick(option: TMenu): void {
    if (option.disabled) return
    if (option.onClick) {
      option.onClick()
    }
  }

  if (options.length === 0) {
    return (
      <Menu as="div" className="relative" style={{ height: 38, zIndex: order || 1 }}>
        <Menu.Button>{children}</Menu.Button>
      </Menu>
    )
  }

  return (
    <Menu as="div" className="relative" style={{ height: 38, zIndex: order || 1 }}>
      <Menu.Button>{children}</Menu.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0">
        <Menu.Items className="menu__popup">
          {options.map((option) => (
            <Menu.Item key={option.id} disabled={option.disabled}>
              {({ active, disabled }) => (
                <div
                  className={`${active ? 'menu__item--selected' : 'menu__item'}
                    ${disabled ? 'disabled' : ''}`}
                  onClick={() => handleOptionClick(option)}>
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              )}
            </Menu.Item>
          ))}
          {/* <Menu.Item>
            <div
              className="flex text-sm items-center gap-1 text-white px-4 py-2"
              style={{ width: 217 }}>
              Testnet Mode{' '}
              <span className="mx-2 text-grey600 font-semibold">
                {chain?.id === goerli.id ? 'On' : 'Off'}
              </span>{' '}
              <Switch enabled={chain?.id === goerli.id} setEnabled={setNetwork} />
            </div>
          </Menu.Item> */}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default Dropdown
