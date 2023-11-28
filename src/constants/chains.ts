import { goerli, mainnet } from 'wagmi'

interface ExplorerUrls {
  [key: number]: string
}

interface BeaconUrls {
  [key: number]: string
}

export const supportedChains =
  process.env.REACT_APP_NETWORK_ID === `${goerli.id}` ? [goerli] : [mainnet]

export const rpcUrls = {
  [mainnet.id]: `${process.env.REACT_APP_MAINNET_RPC}`,
  [goerli.id]: `${process.env.REACT_APP_GOERLI_RPC}`
}

export const explorerUrls: ExplorerUrls = {
  [mainnet.id]: `https://etherscan.io`,
  [goerli.id]: `https://goerli.etherscan.io`
}

export const beaconUrls: BeaconUrls = {
  [mainnet.id]: `https://beaconcha.in`,
  [goerli.id]: `https://prater.beaconcha.in`
}

export const BEACON_NODE_URL = process.env.REACT_APP_BEACON_NODE_URL
