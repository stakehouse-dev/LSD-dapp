import 'twin.macro'

import { FC, useState } from 'react'
import styled from 'styled-components'

import { Search } from '@/components/shared'

import { HealthFilter } from './HealthFilter'
import { ValidatorTable } from './ValidatorTable'
import { ValidatorTableV2 } from './ValidatorTableV2'

type ValidatorListProps = {
  knots: any[]
  validators: Record<string, number[]>
  isProtectedBatches?: boolean
  tableData?: any
}

export type IFilter = {
  status: string
  knotID: string
}

export const ValidatorList: FC<ValidatorListProps> = ({
  knots,
  validators,
  isProtectedBatches = true,
  tableData
}) => {
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<IFilter>({ knotID: '', status: '' })

  const handleSearch = (text: string) => {
    setText(text)
    setFilter({ ...filter, knotID: text })
  }

  const handleClickInput = (e: any) => {
    e.stopPropagation()

    handleSearch(text)
  }

  const resetFilter = () => {
    setFilter({ knotID: '', status: '' })
    setText('')
  }

  const setColorFilter = (status: string) => {
    setFilter({ ...filter, status })
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <div>
          <span className="font-semibold mr-1">Validator List</span>({knots && knots.length})
        </div>
        <SearchWrapper>
          <Search
            onChange={handleSearch}
            onClick={handleClickInput}
            placeHolder="Validator Search"
            value={text}
            onClear={() => {
              setText('')
              setFilter({ ...filter, knotID: '' })
            }}
          />
        </SearchWrapper>
        <HealthFilter
          activeColor={filter.status}
          setFilter={setColorFilter}
          resetFilter={resetFilter}
        />
      </div>
      {isProtectedBatches && (
        <ValidatorTable knots={knots} filter={filter} validators={validators} />
      )}
      {!isProtectedBatches && (
        <ValidatorTableV2
          knots={knots}
          filter={filter}
          validators={validators}
          tableData={tableData}
        />
      )}
    </div>
  )
}

const SearchWrapper = styled.section`
  display: flex;
  flex-direction: column;
  position: relative;
`
