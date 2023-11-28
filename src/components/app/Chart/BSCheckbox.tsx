import { FC, ReactNode, useState } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'

export interface BSCheckboxProps {
  value: boolean
  children?: ReactNode
  color?: string
  tickColor?: string
  disabled?: boolean
  style?: Record<string, number | string>
  className?: string
  onChange?: (isEnabled: boolean) => void
}

export interface StylingVariablesMap {
  [stylingRule: string]: string
}

export const BSCheckbox: FC<BSCheckboxProps> = ({
  value,
  disabled = false,
  children,
  color = '#00ED7B',
  tickColor = '#1C1C1E',
  style = {},
  className = '',
  onChange = () => {}
}) => {
  const styleVariables: StylingVariablesMap = {
    '--bs-checkbox-color': color,
    '--bg-checkbox-tick-color': tickColor
  }
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  return (
    <WrapperStyled
      className={`relative 
        ${disabled ? 'disabled' : ''}
        ${value ? 'active' : 'inactive'}
        ${className}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ ...styleVariables, ...style }}>
      {children && <div className="checkbox-label">{children}</div>}
      {showTooltip && disabled && (
        <Tooltip>A Balance Report is required to display the validator APR.</Tooltip>
      )}
      <input
        type="checkbox"
        disabled={disabled}
        className="checkbox-input"
        checked={value}
        onChange={() => onChange(!value)}
      />
      <span className="checkbox-checkmark" />
    </WrapperStyled>
  )
}
const Tooltip = tw.div`absolute top-full mt-2 -left-1/3 p-4 bg-white rounded-md text-xs text-black text-center`

export const WrapperStyled = styled.label`
  display: inline-flex;
  position: relative;
  width: fit-content;
  height: 16px;
  display: block;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &.disabled {
    cursor: not-allowed;
    .checkbox-label {
      color: gray;
    }
    .checkbox-checkmark {
      opacity: 50%;
    }
  }

  & .checkbox-label {
    margin-left: 24px;
    line-height: 16px;
  }

  & .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 0;
    height: 0;
  }

  & .checkbox-checkmark {
    position: absolute;
    top: 0;
    left: 0;
    transition: 0.2s all;
    box-sizing: border-box;
    border: 1px solid var(--bs-checkbox-color);
    border-radius: 4px;
    width: 16px;
    height: 16px;
  }

  &:not(.disabled):not(.active):hover .checkbox-input ~ .checkbox-checkmark {
    opacity: 0.3;
    background: var(--bs-checkbox-color);
  }

  & .checkbox-input:checked ~ .checkbox-checkmark {
    background-color: var(--bs-checkbox-color);
  }

  & .checkbox-checkmark:after {
    display: none;
    position: absolute;
    content: '';
  }

  & .checkbox-input:checked ~ .checkbox-checkmark:after {
    display: block;
  }

  & .checkbox-checkmark:after {
    top: 2.5px;
    left: 5.5px;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    border: solid var(--bg-checkbox-tick-color);
    border-width: 0 2px 2px 0;
    width: 4px;
    height: 8px;
  }
`
