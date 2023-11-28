import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import IndexChart from '@/components/app/Chart'
import ValidatorChart from '@/components/app/Chart/ChartValidator'
import styles from '@/components/app/style.module.scss'
import { ValidatorList } from '@/components/app/ValidatorList'
import { Spinner } from '@/components/shared'
import { WITHDRAW_MODE } from '@/constants'
import { KnotsByIdsQuery } from '@/graphql/queries/knot'
import { GiantLPTokensQuery } from '@/graphql/queries/LPToken'
import { AllLSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import { useCustomAccount, useNetworkBasedLinkFactories, usePortfolioProtectedBatch } from '@/hooks'
import { humanReadableAddress } from '@/utils/global'

export const ProtectedStaking = () => {
  const navigate = useNavigate()
  const { account } = useCustomAccount()
  const address = account?.address
  const { makeEtherscanTrackerLink } = useNetworkBasedLinkFactories()

  const {
    knotIds,
    loading: knotsIdLoading,
    validators,
    numberOfKnots,
    validator_indexes
  } = usePortfolioProtectedBatch()

  const { data: { knots } = {}, loading } = useQuery(KnotsByIdsQuery, {
    variables: { knots: knotIds },
    fetchPolicy: 'network-only',
    skip: !knotIds || numberOfKnots === 0
  })

  const { data } = useQuery(GiantLPTokensQuery)

  const { data: { liquidStakingNetworks } = {}, loading: networksLoading } =
    useQuery(AllLSDNetworksQuery)

  if (loading || knotsIdLoading || networksLoading) {
    return (
      <div className={styles.centerLoading}>
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto flex w-full flex-col items-center justify-center gap-4 py-8 text-grey25">
      <Title>
        <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={() => navigate('/manage')} />
        Protected Staking Portfolio
      </Title>
      <div className="text-primary500 font-semibold text-xl">
        {address && humanReadableAddress(address)}
      </div>
      <div className="flex gap-4 mb-6 w-full justify-center">
        {data && (
          <ActionButton
            className="px-3"
            href={makeEtherscanTrackerLink(
              `token/${data.giantSavETHPools[0].giantLPToken}?a=${address}`
            )}
            target="_blank">
            Etherscan <ArrowTopRightIcon />
          </ActionButton>
        )}
        <ActionButton
          className="px-3"
          onClick={() =>
            window.open(`/graphql-playground/${WITHDRAW_MODE.STAKING}/${address}`, '_blank')
          }>
          Subgraph <ArrowTopRightIcon />
        </ActionButton>
      </div>

      {numberOfKnots > 0 && <IndexChart />}

      <ValidatorList knots={knots} validators={validators} />
      {knots &&
        knots.length > 0 &&
        knots.map((knot: any) => {
          const lsdIndexes = liquidStakingNetworks.filter(
            (item: any) => item.lsdIndex == validator_indexes[knot.id]
          )

          const lsdIndex = lsdIndexes.length > 0 ? lsdIndexes[0].ticker : validator_indexes[knot.id]
          const _knot = { ...knot, lsdIndex: validator_indexes[knot.id], lsdIndexTicker: lsdIndex }
          return <ValidatorChart knot={_knot} key={knot.id} />
        })}
    </div>
  )
}

const Title = styled.div`
  ${tw`font-semibold flex gap-5 items-center text-white justify-center text-4xl`}
  .icon-left-arrow {
    ${tw`w-6 h-6 cursor-pointer`}
  }
`

const ActionButton = tw.a`flex items-center gap-2 text-sm font-medium py-2 cursor-pointer border rounded-lg border-border`
