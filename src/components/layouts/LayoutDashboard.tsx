import './styles.scss'

import { FC, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAccount, useClient } from 'wagmi'

import { useFlaggedWallet } from '@/hooks/useFlaggedWallet'

import { Bottombar, NotSupportedMobile, Topbar } from './components'

const DashboardLayout: FC = () => {
  const isFlagged = useFlaggedWallet()
  const { connector: activeConnector, isConnected } = useAccount()
  const client = useClient()
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => await client.autoConnect()

    init()
  }, [activeConnector])

  useEffect(() => {
    if (isFlagged || !isConnected) {
      navigate('/sign-in')
    }
  }, [isFlagged, isConnected])

  return (
    <div className="layout">
      <Topbar />
      {isMobile ? <NotSupportedMobile /> : <Outlet />}
      {!isMobile && <Bottombar />}
    </div>
  )
}

export default DashboardLayout
