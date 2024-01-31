import Chart from 'chart.js/auto'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { BSCheckbox } from '../BSCheckbox'
import { BS_CHART_DEFAULT_LINE_COLOR } from './constants'
import { makeChartInstance } from './factories'
import { BSChartProps } from './types'

export const BSChart: FC<BSChartProps> = (props) => {
  const {
    hideLegend = false,
    minWidth = 'auto',
    minHeight = 'auto',
    maxWidth = 'auto',
    maxHeight = 'auto',
    className = '',
    style = {},
    noBalanceReport
  } = props

  const chartElement = useRef(null)
  const [chartInstance, setChartInstance] = useState<Chart | null>(null)
  const [linesVisibilityMap, setLinesVisibilityMap] = useState<Record<number, boolean>>({})
  const [showDotChart, setShowDotChart] = useState(true)

  const isLegendVisible = (() => {
    return !!props.lines.length && !hideLegend
  })()

  const visibleLines = useMemo(() => {
    return props.lines.filter((line, lineIdx) => !!linesVisibilityMap[lineIdx])
  }, [linesVisibilityMap])

  useEffect(() => {
    if (chartInstance) chartInstance.destroy()
    createChartInstance()
  }, [
    props.labels,
    visibleLines,
    showDotChart,
    props.baseAxis,
    props.xLabel,
    props.yLabel,
    props.customization
  ])

  useEffect(() => {
    const visibilityMap: Record<number, boolean> = {}

    props.lines.forEach((line, lineIdx) => {
      visibilityMap[lineIdx] = true
    })

    setLinesVisibilityMap(visibilityMap)
  }, [props.lines])

  function createChartInstance(): void {
    let instance: Chart | null = null

    try {
      instance = makeChartInstance({
        root: chartElement.current,
        ...props,
        dots: showDotChart ? props.dots : undefined,
        lines: visibleLines
      })
    } catch (e) {
      console.error(e)
    }

    if (instance) {
      setChartInstance(instance)
    }
  }

  function changeLineVisibility(isVisible: boolean, lineIdx: number): void {
    setLinesVisibilityMap({
      ...linesVisibilityMap,
      [lineIdx]: isVisible
    })
  }

  return (
    <div className={className} style={{ ...style }}>
      <ChartStyled
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}>
        <canvas id="myChart" ref={chartElement} />
      </ChartStyled>

      {isLegendVisible && (
        <LegendStyled isXAxisNamed={!!props.xLabel}>
          {props.lines.length > 0 &&
            props.lines.map((line, lineIdx) => (
              <BSCheckbox
                key={`chart-line__${lineIdx}`}
                value={!!linesVisibilityMap[lineIdx]}
                disabled={noBalanceReport}
                onChange={(isVisible) => changeLineVisibility(isVisible, lineIdx)}
                color={line.color || BS_CHART_DEFAULT_LINE_COLOR}>
                {line.name || `Line ${lineIdx + 1}`}
              </BSCheckbox>
            ))}
          {props.dots && (
            <BSCheckbox
              key={`chart-dot`}
              value={showDotChart}
              disabled={noBalanceReport}
              onChange={(isVisible) => setShowDotChart(isVisible)}
              color={props.dots.color}>
              {props.dots.name || `Scatter`}
            </BSCheckbox>
          )}
        </LegendStyled>
      )}
    </div>
  )
}

const ChartStyled = styled.div<{
  minWidth: string
  minHeight: string
  maxWidth: string
  maxHeight: string
}>`
  ${({ minWidth, minHeight, maxWidth, maxHeight }: any) => `
    min-width: ${minWidth};
    min-height: ${minHeight};
    max-width: ${maxWidth};
    max-height: ${maxHeight};
  `}
`

const LegendStyled = styled.div<{
  isXAxisNamed: boolean
}>`
  display: flex;
  /* justify-content: space-between; */
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 14px;
  color: #f2f4f7;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  margin-left: 10px;

  ${({ isXAxisNamed }: any) =>
    isXAxisNamed
      ? `
      padding-left: 24px;
    `
      : ''}
`
