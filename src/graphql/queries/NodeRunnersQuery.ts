import gql from 'graphql-tag'

export const NodeRunnersQuery = gql`
  query getNodeRunnersQuery($address: String!, $status: String!) {
    nodeRunners(where: { id: $address }) {
      id
      validators(where: { status: $status }) {
        status
      }
    }
  }
`

export const AllNodeRunnersQuery = gql`
  query getAllNodeRunnersQuery($address: String!) {
    nodeRunners(where: { id: $address }) {
      id
      validators {
        id
        status
        liquidStakingManager
      }
      liquidStakingNetworks {
        id
        ticker
      }
    }
  }
`

export const NodeRunnerNameQuery = gql`
  query nodeRunnerName($address: String!) {
    nodeRunner(id: $address) {
      name
    }
  }
`

export const NodeRunnerByValidatorQuery = gql`
  query nodeRunnerByValidator($address: String!) {
    lsdvalidator(id: $address) {
      smartWallet {
        id
        liquidStakingNetwork {
          id
          feesAndMevPool
          savETHPool
        }
        nodeRunner {
          id
          name
        }
      }
    }
  }
`

export const NodeRunnerStakehouseAddressQuery = gql`
  query NodeRunnerStakehouseAddress($address: String!) {
    lsdvalidator(id: $address) {
      smartWallet {
        id
        liquidStakingNetwork {
          id
          stakehouseAddress
        }
      }
    }
  }
`
