import gql from 'graphql-tag'

export const KnotQuery = gql`
  query Knot($account: String!) {
    savETHIndexes(where: { indexOwner: $account }, orderBy: indexId, orderDirection: asc) {
      id
    }
  }
`
export const savETHIndexQuery = gql`
  query Index($id: String!) {
    savETHIndex(id: $id) {
      dETHTotal
      savETHTotal
      numberOfKnots
    }
  }
`

export const KnotDetailedQuery = gql`
  query Knot($account: String!) {
    savETHIndexes(where: { indexOwner: $account }, orderBy: indexId, orderDirection: asc) {
      numberOfKnots
      indexId
      indexOwner
      label
      dETHPerBlock
      dETHPerYear
      dETHTotal
      dETHTotalRewards
      id
      reportedYield
      savETHTotal
      isolationExchangeRate
    }
  }
`

export const savETHIndexGlobalQuery = gql`
  query SavETHIndexGlobals {
    savETHIndexGlobals {
      reportedYield
    }
  }
`

export const KnotFromSavIndexQuery = gql`
  query getKnotFromSavIndex($indexId: String!) {
    knots(where: { savETHIndexId: $indexId, rageQuit: false }, first: 1000) {
      id
      totalDETHRewardsReceived
      stakeHouseMetadata {
        sETHTicker
      }
    }
  }
`

export const KnotByIDQuery = gql`
  query getKnotById($knotId: String!) {
    knots(where: { id: $knotId, rageQuit: false }, first: 1000) {
      id
      totalDETHRewardsReceived
      savETHIndexId
      stakeHouseMetadata {
        sETHTicker
      }
    }
  }
`

export const SavETHIndexLabel = gql`
  query getSavETHIndexLabel($indexId: String!) {
    savETHIndex(id: $indexId) {
      label
    }
  }
`

export const OpenIndexDETHQuery = gql`
  query getDETHMinted($knots: [ID]) {
    stakehouseAccounts(where: { id_in: $knots }, first: 1000) {
      id
      totalDETHMinted
    }
  }
`

export const savETHIndexesQuery = gql`
  query getSavETHIndexes {
    savETHIndexes(first: 1000) {
      indexId
      label
      numberOfKnots
    }
  }
`

export const KnotsByIdsQuery = gql`
  query KnotsByIds($knots: [ID]) {
    knots(where: { id_in: $knots }, first: 1000) {
      id
      totalDETHRewardsReceived
      stakeHouseMetadata {
        sETHTicker
      }
    }
  }
`
