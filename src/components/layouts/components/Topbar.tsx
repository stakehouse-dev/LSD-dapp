import '../styles.scss'

import { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'

import Logo from '@/assets/images/logo.png'
import { ButtonWalletConnect } from '@/components/app'

import { ChainAlert } from './ChainAlert'
import NavItem from './NavItem'

const Topbar: FC = () => {
  const { isConnected } = useAccount()

  const { pathname } = useLocation()

  return (
    <div>
      <div className="topbar">
        <a href="https://joinstakehouse.com/" target="_blank" rel={'noopener noreferrer'}>
          <img src={Logo} width={54} alt="logo" />
        </a>

        <div className="topbar__navMenu">
          <Link to={'/'}>
            <NavItem active={!pathname.includes('manage')}>Deposit</NavItem>
          </Link>
          <Link to={'/manage'}>
            <NavItem active={pathname.includes('manage')}>Manage</NavItem>
          </Link>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-3">
            <ButtonWalletConnect />
          </div>
        ) : (
          <div />
        )}
      </div>
      <ChainAlert />
    </div>
  )
}

export default Topbar
