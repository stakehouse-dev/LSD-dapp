import gql from 'graphql-tag'

export const ProtectedWithdrawBalanceQuery = gql`
  query WithdrawBalance($account: String!) {
    protectedBatches(where: { liquidityProviders_: { lpAddress: $account } }) {
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

export const ProtectedPoolsBalanceQuery = gql`
  query PoolsBalance($account: String!) {
    lptokens(
      where: {
        liquidityProviders_: { lpAddress_contains_nocase: $account }
        tokenType: "PROTECTED_STAKING_LP"
        lifecycleStatus: "NOT_STAKED"
      }
    ) {
      id
      blsPublicKey
      liquidStakingNetwork {
        id
        ticker
        savETHPool
        feesAndMevPool
      }
      tokenType
      liquidityProviders(where: { lpAddress_contains_nocase: $account }) {
        lpAddress
        amount
        withdrawn
      }
    }
  }
`

export const FeesMevWithdrawBalanceQuery = gql`
  query WithdrawBalance($account: String!) {
    feesAndMevBatches(where: { liquidityProviders_: { lpAddress: $account } }) {
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

export const FeesMevPoolsBalanceQuery = gql`
  query PoolsBalance($account: String!) {
    lptokens(
      where: {
        liquidityProviders_: { lpAddress_contains_nocase: $account }
        tokenType: "FEES_AND_MEV_LP"
        lifecycleStatus: "NOT_STAKED"
      }
    ) {
      id
      liquidStakingNetwork {
        id
        ticker
        savETHPool
        feesAndMevPool
      }
      blsPublicKey
      tokenType
      liquidityProviders(where: { lpAddress_contains_nocase: $account }) {
        lpAddress
        amount
      }
    }
  }
`

export const UnstakedValidatorsQuery = gql`
  query UnstakedValidators($account: String!) {
    protectedBatches(
      where: {
        lsdValidator_: { status: "UNSTAKED" }
        listOfLiquidityProviderAddresses_contains: [$account]
      }
    ) {
      lsdValidator {
        id
        totalETHFromGiantProtectedStakingPool
        smartWallet {
          liquidStakingNetwork {
            id
            ticker
            savETHPool
          }
        }
      }
      vaultLPToken {
        id
      }
      liquidityProviders(where: { lpAddress: $account }) {
        amount
        withdrawn
      }
    }

    feesAndMevBatches(
      where: {
        lsdValidator_: { status: "UNSTAKED" }
        listOfLiquidityProviderAddresses_contains: [$account]
      }
    ) {
      lsdValidator {
        id
        totalETHFromGiantFeesAndMevPool
        smartWallet {
          liquidStakingNetwork {
            id
            ticker
            feesAndMevPool
          }
        }
      }
      vaultLPToken {
        id
      }
      liquidityProviders(where: { lpAddress: $account }) {
        amount
        withdrawn
      }
    }
    lptokens(
      where: {
        lifecycleStatus: "UNSTAKED"
        liquidityProviders_: { lpAddress: $account }
        tokenType_in: ["PROTECTED_STAKING_LP", "FEES_AND_MEV_LP"]
      }
    ) {
      id
      blsPublicKey
      issuer
      tokenType
      liquidityProviders(where: { lpAddress: $account }) {
        lpAddress
        amount
        withdrawn
      }
      liquidStakingNetwork {
        id
        ticker
        feesAndMevPool
      }
    }
    nodeRunners(where: { id: $account }) {
      validators(where: { status: "UNSTAKED" }) {
        id
        status
        smartWallet {
          liquidStakingNetwork {
            id
            ticker
            feesAndMevPool
          }
        }
      }
    }
  }
`

export const RageQuitAssistantQuery = gql`
  query RageQuitAssistants($account: String!, $rageQuitAssistant: String!) {
    lsdrageQuitAssistants(where: { id: $rageQuitAssistant }) {
      dETHBorrowed
      nodeOperator {
        id
      }
      dETHLPToken {
        id
      }
      sETHLPToken {
        id
      }
      dETHLiquidityProviders(where: { lpAddress: $account }) {
        lpAddress
        claimableAmount
      }
      sETHLiquidityProviders(where: { lpAddress: $account }) {
        lpAddress
        claimableAmount
      }
    }
  }
`

export const RageQuitProtectedBatchesQuery = gql`
  query RageQuitProtectedBatches($blsKey: String!, $poolAddress: String!) {
    lptokens(where: { blsPublicKey: $blsKey, liquidityProviders_: { lpAddress: $poolAddress } }) {
      tokenType
      liquidityProviders(where: { lpAddress: $poolAddress }) {
        lpAddress
        amount
        withdrawn
      }
    }
  }
`

export const RageQuitFeesMevBatchesQuery = gql`
  query RageQuitFeesMevBatches($blsKey: String!, $poolAddress: String!) {
    lptokens(where: { blsPublicKey: $blsKey, liquidityProviders_: { lpAddress: $poolAddress } }) {
      tokenType
      liquidityProviders(where: { lpAddress: $poolAddress }) {
        lpAddress
        amount
        withdrawn
      }
    }
  }
`
