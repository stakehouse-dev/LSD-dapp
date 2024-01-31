import gql from 'graphql-tag'

export const LsdValidatorsQuery = gql`
  query Validators($blsPublicKey: String!) {
    stakehouseAccounts(
      where: { id: $blsPublicKey }
      orderBy: registerValidatorBlockNumber
      orderDirection: asc
    ) {
      id
      depositTxHash
      lifecycleStatus
      totalDETHMinted
      totalCollateralizedSLOTInVaultFormatted
      totalSLOT
      sETHMinted
      mintFromBlockNumber
      stakeHouseMetadata {
        id
        sETH
        sETHTicker
        sETHExchangeRate
        sETHPayoffRateFormatted
      }
      knotMetadata {
        isPartOfIndex
        savETHIndexId
      }
    }
  }
`

export const getStakehouseAccount = gql`
  query getStakehouseAccount($blsPublicKey: String!) {
    stakehouseAccount(id: $blsPublicKey) {
      stakeHouse
    }
  }
`

export const getStakehouseAccounts = gql`
  query getStakehouseAccounts($blsPublicKeys: [String]!) {
    stakehouseAccounts(where: { id_in: $blsPublicKeys }) {
      stakeHouse
      id
    }
  }
`

export const getLSDValidatorsCount = gql`
  query getLSDValidatorsCount {
    lsdvalidators(where: { status: "WAITING_FOR_ETH" }, first: 1000) {
      id
    }
  }
`

export const getLSDValidatorStatus = gql`
  query getLSDValidatorStatus($blsKey: String) {
    lsdvalidators(where: { id: $blsKey }) {
      id
      status
    }
  }
`
