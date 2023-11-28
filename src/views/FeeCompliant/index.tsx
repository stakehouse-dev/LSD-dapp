import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as SearchIcon } from '@/assets/images/search.svg'
import { Spinner } from '@/components/shared'
import ShareableLinkButton from '@/components/shared/ShareableLinkButton'
import useAllValidatorFeeHealthQuery from '@/hooks/queries/useAllValidatorFeeHealthQuery'
import useNetworkComplianceScoreQuery from '@/hooks/queries/useNetworkComplianceScoreQuery'

import LSDList from './LSDList'
import PeriodTab, { PERIOD } from './PeriodTab'

const daysAgo = {
  [PERIOD.SIXTY_DAYS]: '60 days ago',
  [PERIOD.WEEK]: '1 week ago',
  [PERIOD.DAY]: '1 day ago'
}

export default function FeeCompliant() {
  const navigate = useNavigate()
  const [activePeriod, setActivePeriod] = useState<PERIOD>(PERIOD.SIXTY_DAYS)
  const [query, setQuery] = useState<string>('')

  const healthData = useAllValidatorFeeHealthQuery(activePeriod)

  const networkCompliance = useNetworkComplianceScoreQuery(activePeriod)

  const onBack = () => {
    navigate(-1)
  }

  const compliance_percentage = useMemo(() => {
    return Number((networkCompliance.data?.network_compliance_score ?? 0) * 100).toFixed(0)
  }, [networkCompliance.data])

  const { compliants, compliant_count, non_compliant_count } = useMemo(() => {
    let compliants = undefined,
      compliant_count = 0,
      non_compliant_count = 0

    if (healthData.data) {
      compliants = healthData.data.data.map((item) => {
        compliant_count += item.compliant_count
        non_compliant_count += item.non_compliant_count
        return item.compliance_score
      })
    }

    return { compliants, compliant_count, non_compliant_count }
  }, [healthData.data])

  return (
    <Wrapper>
      <div className="text-4xl flex items-center gap-5 font-semibold">
        <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={onBack} />
        Fee compliant validator List
      </div>
      <div className="flex mt-6 items-center gap-4 max-w-md mx-auto w-full">
        <div className="w-full flex items-center relative">
          <SearchIcon className="absolute left-3" />
          <input
            className="text-white leading-6 border border-solid outline-none w-full placeholder-grey300 border-grey500 rounded-lg py-2.5 pr-3 pl-10 bg-grey200 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search an LSD Network"
          />
        </div>
      </div>
      <div className="bg-grey200 rounded-2xl w-full px-8 py-4 mt-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-semibold">Validator Fee Recipient Compliance</span>
            <div className="text-base font-medium flex gap-4 text-grey700">
              <div>
                <span
                  className={`${
                    Number(compliance_percentage) > 50 ? 'text-primary500' : 'text-orange2'
                  } font-semibold`}>
                  {compliance_percentage}%
                </span>{' '}
                compliance
              </div>
            </div>
          </div>
          <PeriodTab period={activePeriod} setPeriod={setActivePeriod} />
        </div>
        <div className="flex h-14 gap-2.5 mt-5 justify-center">
          {healthData.isLoading ? (
            <Spinner size={32} />
          ) : (
            compliants &&
            compliants.map((item, index) => <Tick key={index} isCompliant={item === 1} />)
          )}
        </div>
        <div className="flex gap-2.5 items-center w-full mt-3">
          <Label>{daysAgo[activePeriod]}</Label>
          <Divider />
          <Label>{compliance_percentage}% Correct fee addresses</Label>
          <Divider />
          <Label>Today</Label>
        </div>
      </div>
      <Description>
        Check the status of all validators fee recipient addresses in Stakehouse LSD Networks.
      </Description>
      <LSDList query={query} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${tw`text-white flex flex-col items-center w-full mx-auto py-8`}

  max-width: 1100px;
  min-height: calc(100vh - 10rem);
`

const Tick = styled.div<{
  isCompliant: boolean
}>`
  ${tw`w-full`}
  ${(props) => (props.isCompliant ? tw`bg-primary500` : tw`bg-orange2`)}
`
const Description = styled.div`
  ${tw`mr-auto my-10 text-grey300`}
  max-width: 1012px;
`
const Divider = tw.div`h-px flex-grow bg-grey700 bg-opacity-50`

const Label = styled.div``
