export interface BSChartProps {
  labels: Array<string | number>
  lines: BSChartLine[]
  dots?: BSChartLine
  hideLegend?: boolean
  baseAxis?: 'x' | 'y'
  xLabel?: string
  yLabel?: string
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string
  className?: string
  style?: Record<string, string | number>
  customization?: Partial<BSChartCustomization>
  zoomOut?: boolean
  noBalanceReport?: boolean
}

export interface BSChartLine {
  values: any[]
  name?: string
  color?: string
  type?: string
  filled?: boolean
}

export interface BSChartCustomization {
  pointRadiusPx: number
  lineThicknessPx: number
  xAxisAlign: 'start' | 'center' | 'end'
  yAxisAlign: 'start' | 'center' | 'end'
  xAxisPadding: number
  yAxisPadding: number
  axisColor: string
  showXBorder: boolean
  showXTicks: boolean
  showXLevels: boolean
  showYBorder: boolean
  showYTicks: boolean
  showYLevels: boolean
  fontColor: string
  fontSizePx: number
  fontWeight: string
  fontFamily: string
  fontLineHeight: string
}
