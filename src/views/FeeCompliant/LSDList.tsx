import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import tw, { styled } from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ClipboardCopy, Spinner, Tooltip } from '@/components/shared'
import {
  LSDNetworksIndexQuery,
  LSDNetworksQuery,
  LSDNetworksTickerQuery
} from '@/graphql/queries/LSDNetworks'
import { useFetchLsdValidators } from '@/hooks'
import useFeeRecipientHistoryQuery from '@/hooks/queries/useFeeRecipientHistoryQuery'
import useLSDComplianceScoreQuery from '@/hooks/queries/useLSDComplianceScoreQuery'
import { humanReadableAddress, makeBeaconLink } from '@/utils/global'

type ListItemProps = {
  item: {
    id: string
    ticker: string
  }
  isSearchResult?: boolean
}
const ListItem = ({ item, isSearchResult = false }: ListItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const history = useFeeRecipientHistoryQuery(item.id)
  const scoreData = useLSDComplianceScoreQuery(item.id)

  return (
    <>
      <div
        className={`${
          isOpen ? 'border-0' : 'border-t'
        } pt-10 pb-8 border-solid border-innerBorder flex justify-between items-center`}>
        <div className="text-3xl font-bold">
          {item.ticker}{' '}
          {isSearchResult && (
            <span className="text-xs font-normal text-grey500">(Search Result)</span>
          )}
        </div>
        <div className="text-primary700 flex gap-6 items-center">
          {scoreData.isLoading || history.isLoading ? (
            <Spinner size={20} />
          ) : (
            <>
              <span className="text-sm font-medium">
                {Math.ceil((scoreData.data?.compliance_score ?? 0) * 100)}% Correct
              </span>
              <span
                className={`text-3xl cursor-pointer ${isOpen && 'text-white'}`}
                onClick={() => setIsOpen(!isOpen)}>
                +
              </span>
            </>
          )}
        </div>
      </div>
      {history.data && (
        <TableWrapper isOpen={isOpen}>
          <div className="rounded-lg overflow-hidden border border-innerBorder w-full h-full">
            <table className="w-full table-auto border-collapse">
              <TableHead>
                <tr>
                  <TableHeadCell>
                    <Label>
                      Validator Address
                      <Tooltip message="This is your validator address" />
                    </Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">Slot</Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">
                      Correct Fee Recipient Address
                      <Tooltip message="This is the correct fee recipient address that needs to be set to bla bla bla" />
                    </Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">
                      Status
                      <Tooltip message="If your status is correct you are good. If your status is Wrong you need to copy the Correct Fee recipient address nad paste it in the ba bla bla" />
                    </Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">
                      Consensus Layer
                      <Tooltip message="Etherscan Address" />
                    </Label>
                  </TableHeadCell>
                </tr>
              </TableHead>
              <tbody>
                {!history.data.length && (
                  <tr>
                    <TableCell colSpan={5} className="text-center text-sm">
                      There are no exisitng blocks proposed by any validators in this LSD
                    </TableCell>
                  </tr>
                )}
                {history.data.map((record, index) => (
                  <tr key={index}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {humanReadableAddress(record.validator_pubkey)}
                        <ClipboardCopy copyText={record.lsd_fee_recipient} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{record.slot}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {humanReadableAddress(record.lsd_fee_recipient)}
                        <ClipboardCopy copyText={record.lsd_fee_recipient} />
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-sm text-center ${
                        record.compliant ? 'text-primary500' : 'text-orange2'
                      }`}>
                      {record.compliant ? 'Correct Fee Address' : 'Wrong Fee Address'}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      <a
                        href={makeBeaconLink(record.validator_pubkey)}
                        target="_blank"
                        className="flex items-center gap-1 justify-center"
                        rel="noreferrer">
                        Beacon Chain <ArrowTopRightIcon />
                      </a>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TableWrapper>
      )}
    </>
  )
}

export default function LSDList({ query }: { query: string }) {
  const { networks, isLoading } = useFetchLsdValidators()

  const { data: { liquidStakingNetworks } = {} } = useQuery(LSDNetworksQuery, {
    variables: {
      liquidStakingManager: query
    },
    skip: query.length !== 42
  })

  const { data: { liquidStakingNetworks: liquidStakingNetworksByIndex } = {} } = useQuery(
    LSDNetworksIndexQuery,
    {
      variables: {
        lsdIndex: query
      },
      skip: !query.length
    }
  )

  const { data: { liquidStakingNetworks: liquidStakingNetworksByTicker } = {} } = useQuery(
    LSDNetworksTickerQuery,
    {
      variables: {
        ticker: query
      },
      skip: !query.length
    }
  )

  const resultItem = useMemo(() => {
    if (liquidStakingNetworks && liquidStakingNetworks.length > 0)
      return {
        ticker: liquidStakingNetworks[0].ticker,
        id: liquidStakingNetworks[0].id
      }

    if (liquidStakingNetworksByIndex && liquidStakingNetworksByIndex.length > 0)
      return {
        ticker: liquidStakingNetworksByIndex[0].ticker,
        id: liquidStakingNetworksByIndex[0].id
      }

    if (liquidStakingNetworksByTicker && liquidStakingNetworksByTicker.length > 0)
      return {
        ticker: liquidStakingNetworksByTicker[0].ticker,
        id: liquidStakingNetworksByTicker[0].id
      }
  }, [liquidStakingNetworksByIndex, liquidStakingNetworks, liquidStakingNetworksByTicker])

  return (
    <div className="w-full flex flex-col">
      {resultItem && <ListItem item={resultItem} isSearchResult={true} />}
      {isLoading ? (
        <div className="w-full mt-10 flex justify-center items-center">
          <Spinner size={40} />
        </div>
      ) : (
        networks.map((item, index) => <ListItem key={index} item={item} />)
      )}
    </div>
  )
}

const TableHead = tw.thead`text-xs font-medium text-grey300 bg-grey900 bg-opacity-50`
const TableHeadCell = tw.th`px-6 py-3 font-medium`
const Label = tw.div`flex items-center gap-2`
const TableCell = tw.td`px-6 content-center py-4 border-t border-solid border-innerBorder `

const TableWrapper = styled.div<{
  isOpen: boolean
}>`
  ${tw`mt-4 mb-6 overflow-hidden`}

  max-height: ${(props) => (props.isOpen ? '1000px' : '0')};
  transition: max-height 0.8s ease-out;
`
