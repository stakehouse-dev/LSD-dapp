export type BalanceReportT = {
  report: FinalizedReport
  deadline: number
  v: number
  r: string
  s: string
  error?: {
    msg: string
  }
}

export type FinalizedReport = {
  validatorIndex: string
  blsPublicKey: string
  withdrawalCredentials: string
  slashed: false
  activeBalance: string
  effectiveBalance: string
  exitEpoch: string
  activationEpoch: string
  withdrawalEpoch: string
  currentCheckpointEpoch: number
  lastDepositIndex: string
}

export type EligibleValidator = {
  beaconReport: FinalizedReport
  totalDETHRewardsReceived: string
  selected: boolean
}

export enum BALANCE_REPORT_RESULT {
  REPORTED,
  ALREADY_REPORTED,
  NOT_RPORTED
}
