import 'twin.macro'

import { FC } from 'react'

import Search_Icon from '@/assets/images/search.svg'
import { CloseIcon } from '@/components/shared'

import styles from './search.module.scss'

interface SearchProps {
  value: string
  placeHolder?: string
  onChange: (text: string) => void
  onClick?: (e: any) => void
  active?: boolean
  onClear: () => void
}

export const Search: FC<SearchProps> = ({
  value,
  onChange,
  onClick,
  placeHolder = 'Search',
  active,
  onClear
}) => {
  return (
    <div className={styles.search}>
      <div className={active ? styles.searchContainerActive : styles.searchContainer}>
        <img src={Search_Icon} alt="search icon" width={18} height={18} />
        <input
          className={styles.input}
          type="text"
          placeholder={placeHolder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={onClick}
        />

        <div className="flex items-center p-1 cursor-pointer" onClick={onClear}>
          <CloseIcon />
        </div>
      </div>
    </div>
  )
}
