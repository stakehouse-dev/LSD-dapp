import 'twin.macro'

import { FC, useEffect, useMemo, useRef, useState } from 'react'

import KnootDetail from '@/components/app/KnootDetail'
import styles from '@/components/app/style.module.scss'
import { ChartLoadingOverlay, Spinner } from '@/components/shared'
import client from '@/graphql/analyticsClient'
import { BalanceReportsQuery } from '@/graphql/queries/balanceReports'
import fetchEpochWiseApr from '@/lib/fetchEpochWiseApr'
import { humanReadableAddress, makeBeaconLink } from '@/utils/global'

import { BSChart } from '../BSChart'
import { BSChartContainer } from '../BSChartContainer/BSChartContainer'

const ChartValidator: FC<{ knot: any; isInTable?: boolean }> = ({ knot, isInTable = false }) => {
  const [data, setData] = useState<any>()
  const [totaldETHEarnings, setTotaldETHEarnings] = useState(0)
  const [currentEpoch, setCurrentEpoch] = useState(1575)
  const [failedFetchData, setFailedFetchData] = useState(false)
  const [noBalanceReport, setNoBalanceReport] = useState(false)
  const chartRef = useRef(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [validatorEpochData, setValidatorEpochData] = useState<any>()
  const [dataLoading, setDataLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchBalanceReport = async () => {
      setDataLoading(true)

      const { data: { balanceReports: _validatorEpochData } = {} } = await client.query({
        query: BalanceReportsQuery,
        variables: {
          key: knot.id
        }
      })

      setValidatorEpochData(_validatorEpochData)

      setDataLoading(false)
    }

    if (knot.id) fetchBalanceReport()
  }, [knot])

  useEffect(() => {
    const fetchChatData = async () => {
      if (!knot) return
      setLoading(true)
      try {
        const myHeaders = new Headers()
        myHeaders.append('accept', 'application/json')

        const { status, data } = await fetchEpochWiseApr(knot.id)

        if (status === 200) {
          setTotaldETHEarnings(data.totaldETHEarnings)
          setData(data.validatorEpochWiseApr)
        } else {
          setFailedFetchData(true)
        }
      } catch (err) {
        console.log('error: ', err)
        setFailedFetchData(true)
      }

      setLoading(false)
    }

    fetchChatData()
  }, [knot])

  const chartTitle = 'Yield'
  const chartMinHeight = '300px'
  const labels = useMemo(() => {
    if (data) {
      return data
        .map((apr: any) => apr.epoch)
        .reverse()
        .slice(-currentEpoch)
    }

    return null
  }, [data, currentEpoch])

  const lines = useMemo(() => {
    if (data && validatorEpochData) {
      const totalValues = data
        .map((apr: any) => apr.apr)
        .reverse()
        .slice(-currentEpoch)
      const epochRange = data
        .map((apr: any) => apr.epoch)
        .reverse()
        .slice(-currentEpoch)
      const earlyEpoch = epochRange[0]
      const lastEpoch = epochRange[epochRange.length - 1]

      const hasOldEpoches =
        validatorEpochData.length > 0 &&
        validatorEpochData[validatorEpochData.length - 1].currentCheckpointEpoch <
          Number(earlyEpoch)

      const availableBalanceReports = validatorEpochData
        .filter(
          (epoch: any) =>
            Number(epoch.currentCheckpointEpoch) > Number(earlyEpoch) &&
            Number(epoch.currentCheckpointEpoch) < Number(lastEpoch)
        )
        .map((epoch: any) => epoch.currentCheckpointEpoch)
        .reverse()

      const validatorAPRs: any[] = []
      if (availableBalanceReports.length === 1 && hasOldEpoches) {
        labels.forEach((label: string, idx: number) => {
          if (Number(label) <= Number(availableBalanceReports[0])) {
            validatorAPRs.push(totalValues[idx])
          }
        })
      } else if (availableBalanceReports.length === 1 && !hasOldEpoches) {
        labels.forEach((label: string, idx: number) => {
          if (Number(label) < Number(availableBalanceReports[0])) {
            validatorAPRs.push(null)
          } else if (Number(label) === Number(availableBalanceReports[0])) {
            validatorAPRs.push(totalValues[idx])
          }
        })
      } else if (availableBalanceReports.length > 1) {
        labels.forEach((label: string, idx: number) => {
          if (
            Number(label) >= availableBalanceReports[0] &&
            Number(label) <= availableBalanceReports[availableBalanceReports.length - 1]
          ) {
            validatorAPRs.push(totalValues[idx])
          } else {
            validatorAPRs.push(null)
          }
        })
      }

      return [
        {
          values: totalValues,
          color: '#00ed78',
          name: 'Validator APR',
          type: 'linear'
        }
        // {
        //   values: totalValues,
        //   color: '#D1ADFF',
        //   name: 'Consensus Layer APR',
        //   type: 'linear'
        // }
      ]
    }

    return []
  }, [data, currentEpoch, validatorEpochData])

  const dots = useMemo(() => {
    if (data && validatorEpochData) {
      const totalValues = data
        .map((apr: any) => apr.apr)
        .reverse()
        .slice(-currentEpoch)
      const epochRange = data
        .map((apr: any) => apr.epoch)
        .reverse()
        .slice(-currentEpoch)
      const earlyEpoch = epochRange[0]
      const lastEpoch = epochRange[epochRange.length - 1]

      const availableBalanceReports = validatorEpochData
        .filter(
          (epoch: any) =>
            Number(epoch.currentCheckpointEpoch) > Number(earlyEpoch) &&
            Number(epoch.currentCheckpointEpoch) < Number(lastEpoch)
        )
        .map((epoch: any) => epoch.currentCheckpointEpoch)
        .reverse()

      const reportBalances: any[] = []

      // if (availableBalanceReports.length > 0) {
      //   labels.forEach((label: string, idx: number) => {
      //     if (availableBalanceReports.includes(`${label}`)) {
      //       reportBalances.push(totalValues[idx])
      //     } else {
      //       reportBalances.push(null)
      //     }
      //   })
      //   setNoBalanceReport(false)
      // } else {
      //   setNoBalanceReport(true)
      // }

      return {
        values: reportBalances,
        color: '#FFB69F',
        name: 'Balance Report'
      }
    }

    return undefined
  }, [data, validatorEpochData, currentEpoch])

  const currentAPR = useMemo(() => {
    if (data && data.length > 0) {
      return data[0].apr as number
    }

    return 0
  }, [data])

  if (failedFetchData) {
    return <></>
  }

  return (
    <div key={knot.id} className={styles.sections}>
      {!isInTable && (
        <a href={makeBeaconLink(knot.id)} target="_blank" rel="noreferrer">
          <h1 className={`${styles.title} mb-2`}>Validator: {humanReadableAddress(knot.id)}</h1>
        </a>
      )}
      <div className={styles.secondSection} ref={chartRef}>
        <BSChartContainer
          title={chartTitle}
          style={{ width: '100%', margin: 'auto', position: 'relative' }}
          currentEpoch={currentEpoch}
          currentAPR={currentAPR}
          onSetCurrentEpoch={setCurrentEpoch}>
          {(loading || dataLoading) && (
            <ChartLoadingOverlay>
              <Spinner size={64} />
            </ChartLoadingOverlay>
          )}
          <BSChart
            labels={labels}
            lines={lines}
            // dots={dots}
            xLabel=""
            yLabel=""
            minHeight={chartMinHeight}
            zoomOut
            noBalanceReport={noBalanceReport}
          />
        </BSChartContainer>
        <KnootDetail knot={knot} totaldETHEarnings={totaldETHEarnings} currentAPR={currentAPR} />
      </div>
    </div>
  )
}

export default ChartValidator
