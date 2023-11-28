export enum DEPOSIT_MODE {
  MAIN = 'main',
  NODE_OPERATOR = 'node_operator',
  STAKING = 'staking',
  FEES_MEV = 'fees_mev'
}

export enum WITHDRAW_MODE {
  NODE_OPERATOR = 'node_operator',
  STAKING = 'staking',
  FEES_MEV = 'fees',
  UNSTAKED_VALIDATOR = 'unstaked_validator'
}

export enum VALIDATOR_STATUS {
  LEAKING,
  ACTIVE,
  WAITING_FOR_ETH,
  READY,
  MINT_AVAILABLE,
  STAKING
}

export const MIN_AMOUNT = 0.001
export const MAX_GAS_FEE = 0.02
export const API_ENDPOINT =
  process.env.REACT_APP_NETWORK_ID === '1'
    ? 'https://etl.joinstakehouse.com'
    : 'https://etl-goerli.joinstakehouse.com'
export const FEE_API_ENDPOINT =
  process.env.REACT_APP_NETWORK_ID === '1'
    ? 'https://feemonitoring.blockswap.network'
    : 'https://feemonitoring-goerli.blockswap.network'
