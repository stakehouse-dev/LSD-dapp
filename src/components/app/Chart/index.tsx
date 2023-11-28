import { FC, useMemo, useState } from 'react'

import { ChartLoadingOverlay, Spinner } from '@/components/shared'
import { usePortfolioProtectedBatch } from '@/hooks'

import { BSChart } from './BSChart'
import { BSChartContainer } from './BSChartContainer/BSChartContainer'

const IndexChart: FC = () => {
  const [currentEpoch, setCurrentEpoch] = useState(1575)

  const { epoch_apr: data, loading } = usePortfolioProtectedBatch()

  const chartTitle = ''
  const chartMinHeight = '350px'
  const labels = useMemo(() => {
    if (data) {
      return Object.keys(data).slice(-currentEpoch)
    }

    return []
  }, [data, currentEpoch])

  const lines = useMemo(() => {
    if (data) {
      return [
        {
          values: Object.values(data).slice(-currentEpoch),
          color: '#00ed78',
          name: `Portfolio APR`,
          filled: true
        }
      ]
    }

    return []
  }, [data, currentEpoch])

  const currentAPR = useMemo(() => {
    if (lines && lines.length > 0) {
      return lines[0].values[lines[0].values.length - 1] as number
    }

    return 0
  }, [lines])

  return (
    <BSChartContainer
      title={chartTitle}
      style={{ width: '100%', margin: 'auto', position: 'relative' }}
      currentEpoch={currentEpoch}
      currentAPR={currentAPR}
      onSetCurrentEpoch={setCurrentEpoch}
      isIndexChart={true}>
      {loading && (
        <ChartLoadingOverlay>
          <Spinner size={64} />
        </ChartLoadingOverlay>
      )}
      <BSChart labels={labels} lines={lines} xLabel="Epoch" yLabel="" minHeight={chartMinHeight} />
    </BSChartContainer>
  )
}

export default IndexChart
