import { FC, useEffect, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'

import AlertCircleIcon from '@/assets/images/alert-circle-no-bg.svg'

export const ChainAlert: FC = () => {
  const { chain: activeChain, chains } = useNetwork()
  const { isConnected } = useAccount()
  const [isSupprotedChain, setIsSupprotedChain] = useState<boolean>(false)

  useEffect(() => {
    if (chains && activeChain) {
      chains.forEach((chain) => {
        if (chain.id === activeChain.id) {
          setIsSupprotedChain(true)
        }
      })
    }
  }, [activeChain, chains])

  if (isSupprotedChain) return null

  return (
    <>
      {isConnected && (
        <div className=" relative p-4 bg-red500 rounded-xl gap-1 flex flex-col items-center mb-6">
          <div className="text-sm text-red400 font-semibold flex items-center gap-1">
            <img src={AlertCircleIcon} alt="icon" />
            Your wallet is connected to an unsupported network
          </div>
          <span className="text-sm text-red400 mb-2 w-446 text-center">
            Please, refresh the page and switch to {chains[0]?.name}
          </span>
        </div>
      )}
    </>
  )
}
