import tw, { styled } from 'twin.macro'

export enum PERIOD {
  DAY = '1D',
  WEEK = '1W',
  SIXTY_DAYS = '60D'
}

const Periods = [PERIOD.DAY, PERIOD.WEEK, PERIOD.SIXTY_DAYS]

export default function PeriodTab({
  period,
  setPeriod
}: {
  period: PERIOD
  setPeriod: (period: PERIOD) => void
}) {
  return (
    <Wrapper>
      {Periods.map((item, index) => (
        <TabItem key={index} active={item === period} onClick={() => setPeriod(item)}>
          {item}
        </TabItem>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${tw`flex items-center rounded-lg p-1 text-sm font-medium`}
  height: fit-content;
  background: #1c1c1e;
`

const TabItem = styled.div<{
  active: boolean
}>`
  ${tw`flex justify-center items-center py-2 w-14 cursor-pointer rounded-lg`}
  ${(props) => props.active && tw`text-primary700 font-bold bg-primary500 bg-opacity-10`}
`
