import { useQuery } from '@apollo/client'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ReactComponent as EditIcon } from '@/assets/images/icon-edit.svg'
import ValidatorChart from '@/components/app/Chart/ChartValidator'
import { ModalNodeEditName } from '@/components/app/Modals'
import styles from '@/components/app/style.module.scss'
import { ValidatorList } from '@/components/app/ValidatorList'
import { Spinner } from '@/components/shared'
import { WITHDRAW_MODE } from '@/constants'
import { GraphqlContext } from '@/context/GraphqlContext'
import { KnotsByIdsQuery } from '@/graphql/queries/knot'
import { AllLSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import { NodeRunnerNameQuery } from '@/graphql/queries/NodeRunnersQuery'
import { useCustomAccount, usePortfolioNodeOperator } from '@/hooks'
import { humanReadableAddress } from '@/utils/global'

import Stats from './Stats'

export const NodeOperator = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { account } = useCustomAccount()
  const address = account?.address

  const { setValidatorId } = useContext(GraphqlContext)

  useEffect(() => {
    setValidatorId(address?.toLowerCase() || '')
  }, [address])

  const {
    knotIds,
    loading: knotsIdLoading,
    validators,
    numberOfKnots,
    ...restData
  } = usePortfolioNodeOperator()

  const { data: { knots } = {}, loading } = useQuery(KnotsByIdsQuery, {
    variables: { knots: knotIds },
    fetchPolicy: 'network-only',
    skip: !knotIds || numberOfKnots === 0
  })

  const { data: { nodeRunner } = {}, refetch: refetchName } = useQuery(NodeRunnerNameQuery, {
    variables: {
      address: address?.toLowerCase()
    },
    skip: !address,
    fetchPolicy: 'network-only'
  })

  const { data: { liquidStakingNetworks } = {}, loading: networksLoading } =
    useQuery(AllLSDNetworksQuery)

  useEffect(() => {
    if (!isOpen)
      setTimeout(() => {
        refetchName()
        setTimeout(() => {
          refetchName()
        }, 10000)
      }, 5000)
  }, [isOpen])

  if (loading || knotsIdLoading || networksLoading) {
    return (
      <div className={styles.centerLoading}>
        <Spinner />
      </div>
    )
  }
  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col items-center justify-center gap-4 py-8 text-grey25">
      <ModalNodeEditName
        open={isOpen}
        onClose={() => setIsOpen(false)}
        address={address?.toLowerCase() || ''}
      />
      <Title>
        <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={() => navigate('/manage')} />
        Node Operator Portfolio
      </Title>
      <div className="text-primary500 font-semibold text-xl flex items-center gap-3">
        {nodeRunner && nodeRunner.name ? nodeRunner.name : humanReadableAddress(address || '')}
        <div
          onClick={() => setIsOpen(true)}
          className="cursor-pointer border border-black hover:border-border p-1 rounded-full">
          <EditIcon />
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <ActionButton
          className="px-3"
          onClick={() =>
            window.open(`/graphql-playground/${WITHDRAW_MODE.NODE_OPERATOR}/${address}`, '_blank')
          }>
          Subgraph <ArrowTopRightIcon />
        </ActionButton>
      </div>
      <Stats />
      <ValidatorList
        knots={knots}
        validators={validators}
        isProtectedBatches={false}
        tableData={restData}
      />
      {knots &&
        knots.length > 0 &&
        knots.map((knot: any) => {
          const { validator_indexes } = restData
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
