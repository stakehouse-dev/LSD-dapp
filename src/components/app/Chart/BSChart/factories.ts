import { ChartItem } from 'chart.js'
import Chart from 'chart.js/auto'

import { BS_CHART_DEFAULT_LINE_COLOR } from './constants'
import { BSChartCustomization, BSChartLine, BSChartProps } from './types'

export function makeChartInstance({
  root,
  labels,
  lines,
  baseAxis = 'x',
  xLabel = '',
  yLabel = '',
  customization = {},
  dots,
  zoomOut
}: { root: any } & BSChartProps): Chart {
  const fullCustomization: BSChartCustomization = {
    pointRadiusPx: 1,
    lineThicknessPx: 2,
    xAxisAlign: 'end',
    yAxisAlign: 'end',
    xAxisPadding: 0,
    yAxisPadding: 0,
    axisColor: '#3A3A3C',
    showXBorder: true,
    showXTicks: false,
    showXLevels: false,
    showYBorder: false,
    showYTicks: false,
    showYLevels: true,
    fontColor: '#D0D5DD',
    fontSizePx: 10,
    fontWeight: '300',
    fontFamily: 'Montserrat, sans-serif',
    fontLineHeight: '18px',
    ...customization
  }

  const suggestedMin = getSuggestedMin(
    lines.filter((line) => line.values.length > 0),
    zoomOut
  )
  const suggestedMax = getSuggestedMax(
    lines.filter((line) => line.values.length > 0),
    zoomOut
  )

  return new Chart(root as unknown as ChartItem, {
    type: 'line',
    data: {
      labels,
      datasets: makeDatasetsFromLines(lines, dots, root) as any
    },
    options: makeOptions({
      baseAxis,
      xLabel,
      yLabel,
      customization: fullCustomization,
      suggestedMin,
      suggestedMax
    }) as any
  })
}

function getSuggestedMin(lines: BSChartLine[], zoomOut?: boolean) {
  if (lines && lines.length > 0) {
    let customMin = 1000
    lines.forEach((line) => {
      const min = Math.min(...(line.values.filter((value) => value) as number[])) - 0.01
      const yMinVal = min > 0 ? min : 0
      if (customMin > yMinVal) {
        customMin = yMinVal
      }
    })
    return customMin
  }

  return 0
}

function getSuggestedMax(lines: BSChartLine[], zoomOut?: boolean) {
  if (lines && lines.length > 0) {
    let customMax = 0
    lines.forEach((line) => {
      const yMaxVal = Math.max(...(line.values as number[])) + 0.01
      if (customMax < yMaxVal) {
        customMax = yMaxVal
      }
    })
    return customMax
  }

  return null
}

function makeDatasetsFromLines(lines: BSChartLine[], dots: BSChartLine | undefined, root: any) {
  const ctx = (document.getElementById('myChart') as HTMLCanvasElement).getContext('2d')
  let gradient: CanvasGradient
  if (ctx) {
    gradient = ctx.createLinearGradient(0, 320, 0, 0)
    gradient.addColorStop(0, `rgba(0, 237, 123, 0)`)
    gradient.addColorStop(0.1, `rgba(0, 237, 123, 0)`)
    gradient.addColorStop(1, `rgba(0, 237, 123, 0.3)`)
  }

  const equals = (ctx: any, value: any) => (ctx.p0.parsed.y === ctx.p1.parsed.y ? value : undefined)
  const result =
    dots && dots.values.length > 0
      ? [
          {
            type: 'scatter',
            label: 'Balance Report',
            borderColor: '#FFB69F',
            backgroundColor: '#FFB69F',
            data: dots.values.map((dot, idx) => ({ x: idx, y: dot })),
            pointRadius: 5
          },
          ...lines
            .filter((line) => line.values.length > 0)
            .map((line, idx) => ({
              label: line.name || `Line ${idx + 1}`,
              borderColor: line.color || BS_CHART_DEFAULT_LINE_COLOR,
              backgroundColor: line.filled ? gradient : undefined,
              data: line.values,
              borderDash: line.type === 'dash' ? [5, 5] : undefined,
              fill: line.filled,
              strokeColor: 'rgba(151,187,205,1)',
              pointRadius: 0,
              pointColor: 'rgba(151,187,205,1)'
            }))
        ]
      : lines
          .filter((line) => line.values.length > 0)
          .map((line, idx) => ({
            label: line.name || `Line ${idx + 1}`,
            borderColor: line.color || BS_CHART_DEFAULT_LINE_COLOR,
            backgroundColor: line.filled ? gradient : undefined,
            data: line.values,
            borderDash: line.type === 'dash' ? [5, 5] : undefined,
            fill: line.filled,
            strokeColor: 'rgba(151,187,205,1)',
            pointRadius: 0,
            pointColor: 'rgba(151,187,205,1)'
          }))

  return result
}

function makeOptions({
  baseAxis,
  xLabel,
  yLabel,
  customization,
  suggestedMin,
  suggestedMax
}: {
  baseAxis: 'x' | 'y'
  xLabel: string
  yLabel: string
  customization: BSChartCustomization
  suggestedMin: any
  suggestedMax: any
}) {
  const coordSystemStylings = {
    color: customization.fontColor,
    font: {
      size: customization.fontSizePx,
      weight: customization.fontWeight,
      family: customization.fontFamily,
      lineHeight: customization.fontLineHeight
    }
  }

  const ticks = {
    padding: 8,
    ...coordSystemStylings
  }

  return {
    indexAxis: baseAxis,
    responsive: true,
    normalized: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ''

            if (label) {
              label += `: ${typeof context.raw === 'object' ? context.raw.y : context.raw}`
            }
            return label
          }
        }
      }
    },
    elements: {
      point: {
        radius: customization.pointRadiusPx
      },
      line: {
        borderWidth: customization.lineThicknessPx
      }
    },
    scales: {
      x: {
        title: {
          display: !!xLabel,
          text: xLabel,
          align: customization.xAxisAlign,
          padding: customization.xAxisPadding,
          ...coordSystemStylings
        },
        ticks,
        grid: {
          drawBorder: customization.showXBorder,
          drawOnChartArea: customization.showXLevels,
          drawTicks: customization.showXTicks,
          color: customization.axisColor
        }
      },
      y: {
        title: {
          display: !!yLabel,
          text: yLabel,
          align: customization.yAxisAlign,
          padding: customization.yAxisPadding,
          ...coordSystemStylings
        },
        ticks,
        grid: {
          drawBorder: customization.showYBorder,
          drawOnChartArea: customization.showYLevels,
          drawTicks: customization.showYTicks,
          color: customization.axisColor
        },
        suggestedMin,
        suggestedMax
      }
    }
  }
}
