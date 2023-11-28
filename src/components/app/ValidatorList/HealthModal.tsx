import { FC } from 'react'
import tw, { theme } from 'twin.macro'

import { CloseIcon, HoverCard } from '@/components/shared'
import { humanReadableAddress } from '@/utils/global'

import { HealthCircle } from './HealthFilter'

type HealthModalProps = {
  onClose: () => void
  knot: any
}

const StatusItemWrapper = tw.div`flex items-center justify-between py-4 px-6 border-0 border-b border-solid border-grey600`
const Label = tw.div`flex gap-3 text-sm font-medium`

const properties = [
  {
    label: 'Validator Penalties',
    tooltip:
      'The number of SLOT tokens leaked or slashed. Green - Less than 2, Yellow - 2 to 4, Red - Greater than 4'
  },
  {
    label: 'Consensus Layer & Execution Layer',
    tooltip:
      'Checks for differences between consensus layer and execution layer balances after the most recent Balance Report. Green - 100% accountability between derivatives and the validator balance. Red - The validator balance does not match the derivatives minted.'
  },
  {
    label: 'Staking Yield Received',
    tooltip:
      'Verifies that derivatives minted and the validator balance have not exceeded a 1:1 ratio. Green - Validator balance is greater than or equal to dETH minted. Red - Validator balance is less than dETH minted.'
  }
]

const getColorFromStatus = (status: number) => {
  switch (status) {
    case 1:
      return theme`colors.primary500`
    case 0:
      return theme`colors.red200`
    default:
      return theme`colors.yellow300`
  }
}

export const HealthModal: FC<HealthModalProps> = ({ onClose, knot }) => {
  return (
    <div className="fixed z-50 w-full h-full top-0 left-0 bg-grey700 bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="validator-health-modal bg-black p-8 rounded-2xl max-w-xl w-full border-solid border-grey600">
        <div className="flex justify-between mb-4 text-lg font-bold">
          Validator {humanReadableAddress(knot.id)}
          <div onClick={onClose} className="cursor-pointer">
            <CloseIcon />
          </div>
        </div>
        <StatusItemWrapper className="bg-grey200 text-grey300 text-xs font-medium border-none">
          <span>Indicators</span>
          <span>Health</span>
        </StatusItemWrapper>
        {properties.map((item, index) => (
          <StatusItemWrapper key={index}>
            <Label>
              {item.label} <HoverCard text={item.tooltip} />
            </Label>
            <HealthCircle color={getColorFromStatus(knot.statusArray[index])} />
          </StatusItemWrapper>
        ))}
      </div>
    </div>
  )
}
