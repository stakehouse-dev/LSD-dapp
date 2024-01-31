import { useQuery } from '@apollo/client'
import { FC, useEffect, useState } from 'react'
import tw, { theme } from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import ValidatorChart from '@/components/app/Chart/ChartValidator'
import { ClipboardCopy, CloseIcon, HoverCard, Spinner } from '@/components/shared'
import { AllLSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import { makeBeaconLink } from '@/utils/global'

import { IFilter } from '.'
import { HealthCircle } from './HealthFilter'
import { HealthModal } from './HealthModal'

const HEADERS = [
  { label: 'Heath', tooltip: '' },
  { label: 'Validator Address', tooltip: 'Your ETH validator public key.' },
  {
    label: 'Index',
    tooltip: 'The LSD network that the validator is a part of.'
  },
  { label: 'Redemption Rate', tooltip: 'Your redemption rate.' },
  {
    label: 'SLOT Tokens',
    tooltip:
      'Your share of SLOT tokens associated with this validator. Each validator has a total of 8 SLOT tokens.'
  },
  {
    label: 'sETH Tokens',
    tooltip:
      'Your share of sETH associated with this validator. Each validator has a total of 24 sETH. sETH is the liquid and tradable form of SLOT tokens. Each SLOT tokens represents 3 sETH.'
  }
]

const Tooltip: FC = () => (
  <div>
    <HealthRow>
      <HealthCircle color={theme`colors.primary500`} />
      Green - Nominal
    </HealthRow>
    <HealthRow>
      <HealthCircle color={theme`colors.yellow300`} />
      Yellow - Needs attention
    </HealthRow>
    <HealthRow>
      <HealthCircle color={theme`colors.red200`} />
      Red - Issue
    </HealthRow>
  </div>
)

const humanReadableAddress = (address: string) =>
  `${address.substring(0, 12)}...${address.substring(address.length - 6, address.length)}`

type ValidatorTableProps = {
  knots: any
  filter: IFilter
  validators: Record<string, number[]>
  tableData: any
}

export const ValidatorTableV2: FC<ValidatorTableProps> = ({
  knots: _knots,
  filter,
  validators,
  tableData: restData
}) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [knots, setKnots] = useState<any[]>(_knots)

  const [activeKnot, setActiveKnot] = useState({ id: '' })
  const [showChart, setShowChart] = useState(false)

  const { redemption_rate, sETH, validator_slot, validator_indexes } = restData

  const handleRowClick = (knotId: string) => {
    const _activeKnot = knots.filter((knot: any) => knot.id === knotId)[0]
    setActiveKnot(_activeKnot)
    setShowChart(true)
  }

  useEffect(() => {
    const processTableData = async () => {
      setLoading(true)

      const tableData: any[] = []
      const __knots = await Promise.all(
        _knots.map(async (knot: any) => {
          const validatorStatus = (validators[knot.id] as []) || []
          let red = 0,
            yellow = 0

          validatorStatus.map((item) => {
            if (!item) red++
            else if (item !== 1) yellow++
          })

          const statusColor =
            red > 0
              ? theme`colors.red200`
              : yellow > 0
              ? theme`colors.yellow300`
              : theme`colors.primary500`

          tableData.push([statusColor, knot.id])
          return { ...knot, statusArray: validatorStatus }
        })
      )

      setKnots(__knots)
      setTableData(tableData)
      setLoading(false)
    }
    if (_knots && validators && Object.keys(validators).length > 0) processTableData()
  }, [_knots, validators])

  const { data: { liquidStakingNetworks } = {}, loading: networksLoading } =
    useQuery(AllLSDNetworksQuery)

  const isLoading = networksLoading || loading

  const isInFiltered =
    tableData.length > 0
      ? tableData
          .filter((row: any) => row[1].includes(filter.knotID) && row[0].includes(filter.status))
          .filter((row) => row[1].includes(activeKnot.id)).length > 0
      : false

  return (
    <div className="border border-solid border-innerBorder rounded-2xl px-8 py-6">
      {showModal && <HealthModal onClose={() => setShowModal(false)} knot={activeKnot} />}

      <table className="table-auto w-full block">
        <thead className="w-full block">
          <tr className="text-xs flex w-full">
            {HEADERS.map((item, index) => (
              <th
                key={index}
                className={`font-medium py-3 ${index === 1 ? `text-left` : `text-center`} ${
                  !index ? `w-96` : `w-full`
                }`}>
                <div
                  className={`flex items-center  ${
                    [1].includes(index) ? `justify-start` : `justify-center`
                  }`}>
                  <span className="mr-2">{item.label}</span>
                  <HoverCard text={item.tooltip}>{!index && <Tooltip />}</HoverCard>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm font-medium max-h-80 overflow-y-auto block">
          {isLoading && (
            <tr className="w-full flex">
              <td colSpan={5} className="w-full">
                <div className="flex w-full items-center justify-center py-3">
                  <Spinner size={32} />
                </div>
              </td>
            </tr>
          )}
          {!isLoading && tableData.length === 0 && (
            <tr className="w-full flex">
              <td colSpan={5} className="w-full">
                <div className="flex w-full items-center justify-center py-3 bg-grey800 rounded">
                  No Validators Found
                </div>
              </td>
            </tr>
          )}
          {!isLoading &&
            tableData.length > 0 &&
            tableData
              .filter(
                (row: any) => row[1].includes(filter.knotID) && row[0].includes(filter.status)
              )
              .map((row, index) => {
                const lsdIndexes = liquidStakingNetworks.filter(
                  (item: any) => item.lsdIndex == validator_indexes[row[1]]
                )

                return (
                  <tr
                    key={index}
                    className={`w-full flex ${index % 2 === 1 && `bg-grey800`}`}
                    onClick={() => handleRowClick(row[1])}>
                    <td
                      className="py-5 flex justify-center w-96 cursor-pointer"
                      onClick={(e) => {
                        setShowModal(true)
                        const _activeKnot = knots.filter((knot: any) => knot.id === row[1])[0]
                        setActiveKnot(_activeKnot)
                        e.stopPropagation()
                      }}>
                      <HealthCircle color={row[0]} />
                    </td>
                    <td className="text-left w-full py-5 cursor-pointer">
                      <div className="flex items-center gap-1">
                        <span className="mr-2">{humanReadableAddress(row[1])}</span>
                        <ClipboardCopy copyText={row[1]} />
                        <a
                          className="flex items-center"
                          href={makeBeaconLink(row[1])}
                          target="_blank"
                          rel="noreferrer">
                          <ArrowTopRightIcon />
                        </a>
                      </div>
                    </td>
                    <td className="text-center w-full py-5 cursor-pointer text-primary500">
                      <div
                        className="flex items-center gap-1 w-full justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(
                            `https://site-ipfs.joinstakehouse.com/monitoring/index/${
                              validator_indexes[row[1]]
                            }`,
                            '_blank'
                          )
                        }}>
                        {lsdIndexes.length > 0 ? lsdIndexes[0].ticker : validator_indexes[row[1]]}
                        <ArrowTopRightIcon />
                      </div>
                    </td>
                    <td className="text-center w-full py-5 cursor-pointer text-primary500">
                      {Number(redemption_rate[row[1]]).toLocaleString(undefined, {
                        maximumFractionDigits: 3
                      })}
                    </td>
                    <td className="text-center w-full py-5 cursor-pointer">
                      {Number(validator_slot[row[1]]).toLocaleString(undefined, {
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="text-center w-full py-5 cursor-pointer">
                      {Number(sETH[row[1]]).toFixed(1)}
                    </td>
                  </tr>
                )
              })}
        </tbody>
      </table>

      {showChart && isInFiltered && (
        <div className="bg-grey200 bg-opacity-50 p-4 pb-6 relative">
          <CloseButton onClick={() => setShowChart(false)}>
            <CloseIcon width={20} height={20} />
          </CloseButton>
          <ValidatorChart knot={activeKnot} isInTable={true} />
        </div>
      )}
    </div>
  )
}

const HealthRow = tw.div`flex items-center gap-1 text-black`
const CloseButton = tw.div`w-7 h-7 flex items-center justify-center bg-[#353536] cursor-pointer rounded-md border-solid border-2 border-[#1F1F20] absolute right-1.5 top-1.5 z-10`
