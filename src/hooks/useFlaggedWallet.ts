import { useCallback, useEffect, useState } from 'react'

import { useCustomAccount } from './useCustomAccount'

export function useFlaggedWallet() {
  const [isFlagged, setIsFlagged] = useState(false)
  const { account } = useCustomAccount()
  const address = account?.address

  const fetchData = useCallback(async () => {
    if (address !== undefined) {
      try {
        const response = await fetch('https://trm.joinstakehouse.com/risk', {
          method: 'POST',
          body: JSON.stringify({ address: address })
        })
        const responseData = await response.json()
        const isAllowed: boolean = responseData.allowed
        setIsFlagged(!isAllowed)
      } catch (error) {
        console.log('Error useFlaggedWallet:', error)
        setIsFlagged(false)
      }
    }
  }, [address])

  useEffect(() => {
    if (!process.env.REACT_APP_TRM_CALL_DISABLED) {
      fetchData()
    }
  }, [fetchData])

  return isFlagged
}
