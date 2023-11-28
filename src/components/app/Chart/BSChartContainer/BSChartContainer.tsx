import { FC, ReactNode } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'

import { ChartInfo } from './ChartInfo'
import ChartTimelineCard from './ChartTimelineCard'

export interface BSChartContainerProps {
  children: ReactNode
  title: ReactNode | string
  className?: string
  style?: Record<string, string | number>
  currentEpoch: number
  currentAPR: number
  onSetCurrentEpoch: (value: number) => void
  isIndexChart?: boolean
  indexId?: string
}

export const BSChartContainer: FC<BSChartContainerProps> = ({
  children,
  title,
  className = '',
  style = {},
  currentEpoch,
  currentAPR,
  isIndexChart = false,
  onSetCurrentEpoch
}) => {
  return (
    <WrapperStyled className={className} style={{ ...style }}>
      {isIndexChart && <ChartInfo />}
      <RightWrapper>
        {isIndexChart && <div className="text-white font-semibold text-lg">Avg Stake Yield</div>}
        <HeaderWrapper>
          <TopLeftWrapper>
            <HeaderStyled>{title}</HeaderStyled>
            <Value>
              {currentAPR
                ? currentAPR.toLocaleString(undefined, { maximumFractionDigits: 3 })
                : '0'}
              % {isIndexChart && 'APR'}
            </Value>
          </TopLeftWrapper>
          <ChartTimelineCard currentEpoch={currentEpoch} onSetCurrentEpoch={onSetCurrentEpoch} />
        </HeaderWrapper>
        <Label>Yield%</Label>
        <div className="flex-grow">{children}</div>
      </RightWrapper>
    </WrapperStyled>
  )
}

const RightWrapper = tw.div`flex-grow flex flex-col`

const WrapperStyled = styled.div`
  background: #121212;
  color: #afb3ba;
  padding: 24px 32px;
  border: 1px solid #48484a;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border-radius: 16px;
  box-sizing: border-box;
  display: flex;
`

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const HeaderStyled = styled.div``

const Value = styled.h1`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 14px;
  text-align: right;
  text-transform: capitalize;
  color: #ffffff;
  margin-bottom: 0;
`

const TopLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TopRightWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;
  width: 151px;
  height: 44px;
  background: #1c1c1e;
  border-radius: 8px;
`

const DayButton = styled.button`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  color: #d0d5dd;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
`

const ActiveDayButton = styled.button`
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  color: #41c681;
  padding: 8px 12px;
  gap: 8px;
  width: 41px;
  height: 36px;
  background: rgba(0, 237, 123, 0.1);
  border-radius: 8px;
  border: none;
`

const Label = styled.p`
  font-style: normal;
  font-weight: 700;
  font-size: 10px;
  line-height: 22px;
  text-align: center;
  color: #ffffff;
  padding-left: 10px;
  margin-bottom: 0;
  text-align: left;
`

const HoverCardWrapper = styled.div`
  position: relative;
  top: 2px;
`
