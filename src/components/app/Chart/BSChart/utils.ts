import { ChartItem } from 'chart.js'
import Chart from 'chart.js/auto'

import { BS_CHART_DEFAULT_LINE_COLOR } from './constants'
import { BSChartLine } from './types'

export function makeChartInstance({
  root,
  labels,
  lines,
  baseAxis,
  xLabel,
  yLabel
}: {
  root: any
  labels: Array<string | number>
  lines: BSChartLine[]
  baseAxis: 'x' | 'y'
  xLabel: string
  yLabel: string
}): Chart {
  return new Chart(root as unknown as ChartItem, {
    type: 'line',
    data: {
      labels,
      datasets: makeDatasetsFromLines(lines)
    },
    options: makeOptions({ baseAxis, xLabel, yLabel }) as any
  })
}

function makeDatasetsFromLines(lines: BSChartLine[]) {
  return lines.map((line, idx) => ({
    label: line.name || `Line ${idx + 1}`,
    borderColor: line.color || BS_CHART_DEFAULT_LINE_COLOR,
    backgroundColor: line.color || BS_CHART_DEFAULT_LINE_COLOR,
    data: line.values,
    borderWidth: 2
  }))
}

function makeOptions({
  baseAxis,
  xLabel,
  yLabel
}: {
  baseAxis: 'x' | 'y'
  xLabel: string
  yLabel: string
}) {
  return {
    indexAxis: baseAxis,
    responsive: false,
    plugins: {
      legend: {
        display: false
      }
    },
    elements: {
      point: {
        radius: 2
      },
      line: {
        borderWidth: 2
      }
    },
    scales: {
      x: {
        title: {
          font: {
            weight: 700
          },
          display: !!xLabel,
          text: xLabel,
          align: 'end',
          padding: 0
        }
      },
      y: {
        title: {
          display: !!yLabel,
          text: yLabel,
          align: 'end',
          padding: 0
        }
      }
    }
  }
}
