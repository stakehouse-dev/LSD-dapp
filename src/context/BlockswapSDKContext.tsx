import { StakehouseSDK } from '@blockswaplab/stakehouse-sdk'
import { createContext, FC, PropsWithChildren, useEffect, useState } from 'react'
import { useConnect, useNetwork, useSigner, useSwitchNetwork } from 'wagmi'

import { config } from '@/constants/environment'
import { TStakehouseSDK } from '@/types'

interface IContextProps {
  sdk: TStakehouseSDK | null
}

const AUTOCONNECTED_CONNECTOR_IDS = ['safe']

function useAutoConnect() {
  const { connect, connectors } = useConnect()

  useEffect(() => {
    AUTOCONNECTED_CONNECTOR_IDS.forEach((connector) => {
      const connectorInstance = connectors.find((c) => c.id === connector && c.ready)

      if (connectorInstance) {
        connect({ connector: connectorInstance })
      }
    })
  }, [connect, connectors])
}

export const BlockswapSDKContext = createContext<IContextProps>({
  sdk: null
})

const BlockswapSDKProvider: FC<PropsWithChildren> = ({ children }) => {
  const [sdk, setSDK] = useState<TStakehouseSDK | null>(null)
  const { data: signer } = useSigner()
  const { chain: activeChain, chains } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  useAutoConnect()

  useEffect(() => {
    if (chains && activeChain) {
      let isSupprotedChain = false
      chains.forEach((chain) => {
        if (chain.id === activeChain.id) {
          isSupprotedChain = true
        }
      })
      if (!isSupprotedChain && switchNetwork) {
        switchNetwork(chains[0].id)
      }
    }
  }, [activeChain, chains, switchNetwork])

  useEffect(() => {
    if (signer && activeChain?.id === config.networkId) {
      try {
        const sdk = new StakehouseSDK(signer)
        setSDK(sdk)
      } catch (err) {
        console.log('err: ', err)
      }
    }
  }, [signer, activeChain])

  return <BlockswapSDKContext.Provider value={{ sdk }}>{children}</BlockswapSDKContext.Provider>
}

export default BlockswapSDKProvider
