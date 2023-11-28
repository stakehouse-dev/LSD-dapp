import gql from 'graphql-tag'

export const ProtectedStakedBalanceQuery = gql`
  query StakedBalance($account: String!) {
    protectedBatches(
      where: {
        liquidityProviders_: { lpAddress: $account }
        vaultLPToken_: { lifecycleStatus_in: ["STAKED", "MINTED_DERIVATIVES"] }
      }
    ) {
      vaultLPToken {
        lifecycleStatus
      }
      liquidityProviders(where: { lpAddress: $account }) {
        lpAddress
        amount
        withdrawn
      }
    }
  }
`

export const FeesMevStakedBalanceQuery = gql`
  query StakedBalance($account: String!) {
    feesAndMevBatches(
      where: {
        liquidityProviders_: { lpAddress: $account }
        vaultLPToken_: { lifecycleStatus_in: ["STAKED", "MINTED_DERIVATIVES"] }
      }
    ) {
      vaultLPToken {
        lifecycleStatus
      }
      liquidityProviders(where: { lpAddress: $account }) {
        lpAddress
        amount
        withdrawn
      }
    }
  }
`
