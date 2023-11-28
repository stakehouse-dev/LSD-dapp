import gql from 'graphql-tag'

export const LSDNetworksQuery = gql`
  query getLSDNetworks($liquidStakingManager: Bytes!) {
    liquidStakingNetworks(where: { liquidStakingManager: $liquidStakingManager }) {
      id
      feesAndMevPool
      savETHPool
      ticker
      feeRecipientAndSyndicate
    }
  }
`

export const LSDNetworksIndexQuery = gql`
  query getLSDNetworks($lsdIndex: Bytes!) {
    liquidStakingNetworks(where: { lsdIndex: $lsdIndex }) {
      id
      feesAndMevPool
      savETHPool
      ticker
      feeRecipientAndSyndicate
    }
  }
`

export const LSDNetworksTickerQuery = gql`
  query getLSDNetworks($ticker: Bytes!) {
    liquidStakingNetworks(where: { ticker_contains_nocase: $ticker }) {
      id
      feesAndMevPool
      savETHPool
      ticker
      feeRecipientAndSyndicate
    }
  }
`

export const AllLSDNetworksQuery = gql`
  query getAllLSDNetworks {
    liquidStakingNetworks(first: 1000) {
      id
      lsdIndex
      ticker
      commission
      feeRecipientAndSyndicate
    }
  }
`
