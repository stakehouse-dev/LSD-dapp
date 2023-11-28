import gql from 'graphql-tag'

export const BalanceReportsQuery = gql`
  query GetChartBalanceReports($key: String!) {
    balanceReports(
      first: 1000
      orderBy: currentCheckpointEpoch
      orderDirection: desc
      where: { blsPublicKey: $key }
    ) {
      currentCheckpointEpoch
    }
  }
`
