import gql from 'graphql-tag'

export const ActivityQuery = gql`
  query Activity($account: String!) {
    events(
      where: {
        key_in: [
          "ETH_DEPOSITED_BY_STAKER"
          "LP_BURNED_FOR_ETH"
          "GIANT_LP_SWAPPED"
          "SMART_WALLET_CREATED"
          "NEW_VALIDATOR_REGISTERED"
          "LP_TOKEN_ISSUED"
          "GIANT_LP_BURNED_FOR_DETH"
          "LP_TOKEN_MINTED"
          "KNOT_STAKED"
          "STAKEHOUSE_CREATED"
          "STAKEHOUSE_JOINED"
          "DETH_CLAIMED"
          "FEES_AND_MEV_CLAIMED"
          "NODE_RUNNER_REWARDS_CLAIMED"
          "BLS_PUBLIC_KEY_WITHDRAWN"
          "NODE_RUNNER_NAME_UPDATED"
          "VALIDATOR_UNSTAKED"
          "PROTECTED_STAKING_LP_BURNED"
          "LSDN_DEPLOYED"
          "RAGE_QUIT_ASSISTANT_DEPLOYED"
          "RAGE_QUIT_LP_MINTED"
          "RAGE_QUIT_LP_BURNED"
          "LSD_NAME_UPDATED"
          "DAO_COMMISSION_UPDATED"
          "SWEEP_REPORTED"
          "FINAL_SWEEP_REPORTED"
        ]
        from: $account
      }
      orderBy: blockNumber
      orderDirection: desc
      first: 1000
    ) {
      id
      tx
      key
      value
      blsPubKeyForKnot
      blockNumber
    }
  }
`
