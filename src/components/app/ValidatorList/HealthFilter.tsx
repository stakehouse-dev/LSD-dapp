import { FC } from 'react'
import tw, { styled, theme } from 'twin.macro'

type HealthFilterProps = {
  setFilter: (color: string) => void
  activeColor: string
  resetFilter: () => void
}

const colors = [theme`colors.primary500`, theme`colors.yellow300`, theme`colors.red200`]

export const HealthFilter: FC<HealthFilterProps> = ({ activeColor, setFilter, resetFilter }) => {
  return (
    <Wrapper>
      <Item active={!activeColor} onClick={() => resetFilter()}>
        All
      </Item>
      {colors.map((color, index) => (
        <Item key={index} active={color === activeColor} onClick={() => setFilter(color)}>
          <HealthCircle color={color} />
        </Item>
      ))}
    </Wrapper>
  )
}

export const HealthCircle = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  ${tw`rounded-full w-2.5 h-2.5 m-1`}
`

const Wrapper = tw.div`flex items-center text-grey300 text-xs p-1 rounded-lg bg-[#1C1C1E]`

const Item = styled.div<{
  active?: boolean
}>`
  ${({ active = false }) => active && tw`bg-white bg-opacity-10`}
  ${tw`px-3 h-[34px] flex items-center hover:bg-white hover:bg-opacity-10 rounded-lg cursor-pointer`}
`
