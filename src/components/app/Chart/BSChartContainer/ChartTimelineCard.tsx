import { FC, useMemo } from 'react'
import styled from 'styled-components'

import ChartTimelineButton from './ChartTimelineButton'

interface ChartTimelineCardProps {
  currentEpoch: number
  onSetCurrentEpoch: (value: number) => void
}

type Button = {
  name: string
  value: number
  isActive: boolean
}

const ChartTimelineCard: FC<ChartTimelineCardProps> = ({ currentEpoch, onSetCurrentEpoch }) => {
  const buttons: Button[] = useMemo(
    () => [
      {
        name: '1H',
        value: 9,
        isActive: currentEpoch === 9
      },
      {
        name: '1D',
        value: 225,
        isActive: currentEpoch === 225
      },
      {
        name: '1W',
        value: 1575,
        isActive: currentEpoch === 1575
      }
    ],
    [currentEpoch]
  )

  const handleSelection = (value: number) => {
    onSetCurrentEpoch(value)
  }

  return (
    <Wrapper>
      {buttons.map(({ name, isActive, value }, index) => (
        <ChartTimelineButton
          key={index}
          text={name}
          isActive={isActive}
          onActive={() => handleSelection(value)}
        />
      ))}
    </Wrapper>
  )
}

export default ChartTimelineCard

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;
  width: 151px;
  height: 44px;
  background: #1c1c1e;
  border-radius: 8px;
  gap: 4px;
`
