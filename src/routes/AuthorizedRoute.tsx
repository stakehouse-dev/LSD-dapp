import { FC, PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAccount, useConnect } from 'wagmi'

const AuthorizedRoute: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation()
  const { isLoading } = useConnect()
  const { address: account, isConnected, isConnecting } = useAccount()

  if (isLoading || isConnecting) {
    return <></>
  }

  if (!account && !isConnected) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default AuthorizedRoute
