import './styles.scss'

import { ChangeEvent } from 'react'

interface CheckboxProps {
  label: string
  checked?: boolean
  disabled?: boolean
  onChange?: (b: boolean) => void
}

export const Checkbox = ({ label, checked, disabled, onChange }: CheckboxProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.checked)
  }

  return (
    <label className="container">
      {label}
      <input type="checkbox" checked={checked} disabled={disabled} onChange={handleChange} />
      <span className={!disabled ? 'checkmark' : 'checkmark--disabled'}></span>
    </label>
  )
}
