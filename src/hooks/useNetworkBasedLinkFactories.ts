import { useNetwork } from 'wagmi'

import { beaconUrls, explorerUrls, supportedChains } from '@/constants/chains'
import { remove0x } from '@/utils/global'

export function useNetworkBasedLinkFactories() {
  const { chain: activeChain } = useNetwork()

  const makeEtherscanLink = (hash: string, isGnosis?: boolean, isAddress: boolean = false) => {
    const chainId = activeChain?.id || supportedChains[0].id
    const explorerUrl = explorerUrls[chainId]
    return isAddress ? `${explorerUrl}/address/${hash}` : `${explorerUrl}/tx/${hash}`
  }
  const makeEtherscanTrackerLink = (hash: string) => {
    const chainId = activeChain?.id || supportedChains[0].id
    const explorerUrl = explorerUrls[chainId]
    return `${explorerUrl}/${hash}`
  }

  function makeBeaconLink(account: string) {
    const chainId = activeChain?.id || supportedChains[0].id
    const beaconUrl = beaconUrls[chainId]
    return `${beaconUrl}/validator/${remove0x(account)}`
  }

  return { makeEtherscanLink, makeBeaconLink, makeEtherscanTrackerLink }
}
