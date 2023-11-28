import { goerli, mainnet } from 'wagmi'

interface Config {
  networkId: number
  dethTokenAddress: string | undefined
  GRAPHQL_URL: string | undefined
  LSD_GRAPHQL_URL: string | undefined
  WITHDRAWAL_CREDENTIALS: string | undefined
}

const envConfigs: { [key: number]: Config } = {
  [mainnet.id]: {
    networkId: mainnet.id,
    dethTokenAddress: process.env.REACT_APP_MAINNET_DETH_TOKEN_ADDRESS,
    GRAPHQL_URL: process.env.REACT_APP_MAINNET_URL,
    LSD_GRAPHQL_URL: process.env.REACT_APP_MAINNET_LSD_GRAPHQL_URL,
    WITHDRAWAL_CREDENTIALS: process.env.REACT_APP_MAINNET_WITHDRAWAL_CREDENTIALS
  },
  [goerli.id]: {
    networkId: goerli.id,
    dethTokenAddress: process.env.REACT_APP_GOERLI_DETH_TOKEN_ADDRESS,
    GRAPHQL_URL: process.env.REACT_APP_GRAPHQL_URL,
    LSD_GRAPHQL_URL: process.env.REACT_APP_LSD_GRAPHQL_URL_GOERLI,
    WITHDRAWAL_CREDENTIALS: process.env.REACT_APP_GOERLI_WITHDRAWAL_CREDENTIALS
  }
}

export const config = envConfigs[Number(process.env.REACT_APP_NETWORK_ID!)]
