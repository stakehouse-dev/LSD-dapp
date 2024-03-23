import { useQuery } from '@apollo/client'
import { FC, useEffect, useState } from 'react'
import tw, { theme } from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import ValidatorChart from '@/components/app/Chart/ChartValidator'
import { ClipboardCopy, CloseIcon, HoverCard, Spinner } from '@/components/shared'
import { AllLSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import { usePortfolioProtectedBatch } from '@/hooks'
import fetchEpochWiseApr from '@/lib/fetchEpochWiseApr'
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
  {
    label: 'Current Delta',
    tooltip:
      'The current rate of yield of the validator compared with the yield from the last Balance Report. Positive numbers mean the validator is yielding at a higher rate than the last reported balance.'
  },
  { label: 'Total dETH', tooltip: 'Total dETH' },
  { label: 'dETH Earned', tooltip: 'Total amount of dETH earned by the validator.' },
  {
    label: '% of Validator dETH',
    tooltip: 'The proportion of dETH the validator has earned for the selected index.'
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
}

export const ValidatorTable: FC<ValidatorTableProps> = ({ knots: _knots, filter, validators }) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [knots, setKnots] = useState<any[]>(_knots)

  const [activeKnot, setActiveKnot] = useState({ id: '' })
  const [showChart, setShowChart] = useState(false)

  const { validator_earnings, dETHEarnings, validator_indexes } = usePortfolioProtectedBatch()

  const { data: { liquidStakingNetworks } = {}, loading: networksLoading } =
    useQuery(AllLSDNetworksQuery)

  const isLoading = networksLoading || loading

  const handleCellClick = (index: number, knotId: string) => {
    const _activeKnot = knots.filter((knot: any) => knot.id === knotId)[0]
    setActiveKnot(_activeKnot)
    if (!index) {
      setShowModal(true)
    } else setShowChart(true)
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

          const { status, data } = await fetchEpochWiseApr(knot.id)

          if (status === 400) return

          const totaldETHEarnings = data.totaldETHEarnings

          const ethTotaldETHEarnings = totaldETHEarnings
          const ethTotalDETHRewardsReceived = knot.totalDETHRewardsReceived / 1000000000

          const rawDelta =
            ((ethTotaldETHEarnings - ethTotalDETHRewardsReceived / 1000000000) /
              (24 * 1000000000)) *
            100
          const delta = rawDelta.toLocaleString(undefined, { maximumFractionDigits: 3 })

          const formattedETHEarnings =
            totaldETHEarnings > 0
              ? totaldETHEarnings / 1000000000 > 0.001
                ? (totaldETHEarnings / 1000000000).toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })
                : '< 0.001'
              : 0

          tableData.push([
            statusColor,
            knot.id,
            validator_indexes[knot.id],
            `${parseFloat(delta) >= 0 ? '+' : ''}${delta}%`,
            dETHEarnings[knot.id]
              ? Number(
                  validator_earnings[knot.id] * 24 + dETHEarnings[knot.id] / 1000000000
                ).toLocaleString(undefined, {
                  maximumFractionDigits: 3
                })
              : 0,
            formattedETHEarnings,
            Number(validator_earnings[knot.id] * 100).toLocaleString(undefined, {
              maximumFractionDigits: 2
            }) + '%'
          ])
          return { ...knot, statusArray: validatorStatus }
        })
      )

      setKnots(__knots)
      setTableData(tableData)
      setLoading(false)
    }
    if (_knots && validators && Object.keys(validators).length > 0) processTableData()
  }, [_knots, validators])

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
                  (item: any) => item.lsdIndex == row[2]
                )

                return (
                  <tr key={index} className={`w-full flex ${index % 2 === 1 && `bg-grey800`}`}>
                    {row.map((cell: any, i: number) => (
                      <td
                        key={i}
                        className={`py-5 text-center cursor-pointer  ${
                          !i ? `flex justify-center w-96` : `w-full`
                        } ${i === 1 && `text-left`} ${
                          i == 2 && (parseFloat(cell) >= 0 ? `text-primary500` : `text-red200`)
                        }`}
                        onClick={() => handleCellClick(i, row[1])}>
                        {!i && <HealthCircle color={cell} />}
                        {i === 1 && (
                          <div className="flex items-center gap-1">
                            <span className="mr-2">{humanReadableAddress(cell)}</span>
                            <ClipboardCopy copyText={cell} />
                            <a
                              className="flex items-center"
                              href={makeBeaconLink(cell)}
                              target="_blank"
                              rel="noreferrer">
                              <ArrowTopRightIcon />
                            </a>
                          </div>
                        )}
                        {i > 1 && i !== 2 && cell}
                        {i === 2 && (
                          <div
                            className="flex items-center gap-1 w-full justify-center"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(
                                `https://joinstakehouse.com/monitoring/index/${cell}`,
                                '_blank'
                              )
                            }}>
                            {lsdIndexes.length > 0 ? lsdIndexes[0].ticker : cell}
                            {cell && <ArrowTopRightIcon />}
                          </div>
                        )}
                      </td>
                    ))}
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
