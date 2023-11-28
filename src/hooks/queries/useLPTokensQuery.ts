import { useQuery } from '@apollo/client'
import { ethers } from 'ethers'
import { useMemo } from 'react'

import { GetLPTokensQuery } from '@/graphql/queries/LPToken'
import { CommonValidatorsQuery } from '@/graphql/queries/NodeRunners'

import { useCustomAccount } from '../useCustomAccount'

export const useLPTokensQuery = (status: string, tokenType: string) => {
  const { account } = useCustomAccount()
  const address = account?.address

  const { data: { lptokens } = {} } = useQuery(GetLPTokensQuery, {
    variables: {
      address: address,
      status_in: status === 'NOT_STAKED' ? ['NOT_STAKED'] : ['STAKED', 'MINTED_DERIVATIVES'],
      tokenType
    },
    skip: !address || !status || !tokenType
  })

  const { data: { nodeRunners } = {} } = useQuery(CommonValidatorsQuery, {
    variables: {
      account: address?.toLowerCase(),
      status_in:
        status === 'NOT_STAKED'
          ? ['WAITING_FOR_ETH', 'READY_TO_STAKE']
          : ['STAKED', 'MINTED_DERIVATIVES']
    },
    skip: !address || !!tokenType
  })

  const amount = useMemo(() => {
    if (tokenType && lptokens && lptokens.length > 0) {
      let sum = 0
      lptokens.forEach((lptoken: any) => {
        const amount = lptoken.liquidityProviders[0].amount
        sum += Number(ethers.utils.formatEther(ethers.BigNumber.from(amount)))
      })
      return sum
    }

    if (!tokenType && nodeRunners && nodeRunners.length > 0) {
      return nodeRunners[0].validators.length * 4
    }

    return 0
  }, [lptokens, nodeRunners, tokenType])

  return { amount }
}
