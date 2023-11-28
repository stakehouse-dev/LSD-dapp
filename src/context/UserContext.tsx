import { createContext, FC, PropsWithChildren, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { useQueryString } from '@/hooks/useQueryString'

export interface UserContextProps {
  account: any
  isGnosis: boolean
  facilitateInfo: any
  setFacilitateInfo: (info: any) => void
}

export const UserContext = createContext<UserContextProps>({
  account: undefined,
  isGnosis: false,
  facilitateInfo: undefined,
  setFacilitateInfo: (info: any) => {}
})

const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const { connector: activeConnector } = useAccount()
  const account = useAccount()

  const [customAccount, setCustomAccount] = useState<any>()
  const [isGnosis, setIsGnosis] = useState<boolean>(false)

  const [spoofedAddress, setSpoofedAddress] = useState<string>('')
  const [facilitateInfo, setFacilitateInfo] = useState<any>('')
  const queryString = useQueryString()
  const spoofedAddressFromQuery = queryString.get('address') ?? ''

  useEffect(() => {
    setSpoofedAddress(spoofedAddressFromQuery)
  }, [])

  useEffect(() => {
    const fetchAccount = async () => {
      if (activeConnector) {
        if (activeConnector.id === 'safe') {
          setIsGnosis(true)
          setCustomAccount(account)
        } else if (activeConnector.id !== 'safe') {
          if (spoofedAddress && process.env.REACT_APP_DEBUG === 'true') {
            setCustomAccount({ address: spoofedAddress })
          } else {
            setCustomAccount(account)
          }
          setIsGnosis(false)
        }
      } else {
        setCustomAccount(undefined)
        setIsGnosis(false)
      }
    }

    fetchAccount()
  }, [activeConnector])

  return (
    <UserContext.Provider
      value={{ account: customAccount, isGnosis, facilitateInfo, setFacilitateInfo }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
