export type ValidatorT = {
  id: string
  lifecycleStatus: ValidatorLifecycleStatuses
  depositTxHash: string
  totalDETHMinted: string
  totalCollateralizedSLOTInVaultFormatted: number
  totalSLOT: string
  sETHMinted: string
  mintFromBlockNumber?: number
  stakeHouseMetadata?: {
    id: string
    sETH: string
    sETHExchangeRate: string
    sETHTicker: string
    sETHPayoffRateFormatted: string
  }
  knotMetadata?: {
    isPartOfIndex: boolean
    savETHIndexId: string
  }
}

export enum ValidatorLifecycleStatuses {
  init = '0',
  credentialsRegistered = '1',
  depositCompleted = '2',
  derivativesMinted = '3',
  exited = '4'
}

export type ValidatorInOpenIndex = {
  id: string
  totalDETHRewardsReceived: string
  selected: boolean
}
