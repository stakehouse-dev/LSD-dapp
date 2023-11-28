import type { CSSProperties } from 'react'
import { FC } from 'react'
import styled from 'styled-components'

interface ChartTimelineButtonProps {
  text: string
  isActive: boolean
  onActive: (state: boolean, name: string) => void
}

const ChartTimelineButton: FC<ChartTimelineButtonProps> = ({
  text,
  isActive = false,
  onActive
}) => {
  const btnColor = isActive ? '#41c681' : '#d0d5dd'
  const btnBackgroundColor = isActive ? 'rgba(0, 237, 123, 0.1)' : 'none'
  const btnFontWeight = isActive ? '700' : '500'

  const handleClick = () => {
    onActive(!isActive, text)
  }

  return (
    <Wrapper
      onClick={handleClick}
      style={
        {
          '--button-color': btnColor,
          '--button-background-color': btnBackgroundColor,
          '--btn-font-weight': btnFontWeight
        } as CSSProperties
      }>
      {text}
    </Wrapper>
  )
}

export default ChartTimelineButton

const Wrapper = styled.button`
  font-style: normal;
  font-weight: var(--btn-font-weight);
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  width: 100%;
  height: 100%;
  border: none;
  padding: 8px 12px;
  gap: 8px;
  border-radius: 8px;
  color: var(--button-color);
  background: var(--button-background-color);
`
