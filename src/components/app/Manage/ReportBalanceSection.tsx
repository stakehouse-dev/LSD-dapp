import { useEffect } from 'react'
import tw from 'twin.macro'

import { ReactComponent as CheckIcon } from '@/assets/images/icon-check-white.svg'
import { Button, ClipboardCopy, Spinner } from '@/components/shared'
import { useReportBalance } from '@/hooks'
import { BalanceReportT } from '@/types'
import { humanReadableAddress } from '@/utils/global'

interface ReportBalanceSectionProps {
  blsKey: string
  index: number
  onSubmitted: (signature: BalanceReportT) => void
}

export const ReportBalanceSection = ({ blsKey, index, onSubmitted }: ReportBalanceSectionProps) => {
  const { handleSubmit, signature, isSubmitted, isSubmitting } = useReportBalance()

  useEffect(() => {
    if (isSubmitted && signature) {
      onSubmitted(signature)
    }
  }, [isSubmitted, signature])

  return (
    <tr key={blsKey} className="border-t border-innerBorder text-sm font-medium">
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <ClipboardCopy copyText={blsKey}>{humanReadableAddress(blsKey, 9)}</ClipboardCopy>
      </TableCell>
      <TableCell>
        {!isSubmitted ? (
          isSubmitting ? (
            <div className="flex items-center justify-center">
              <Spinner size={32} />
            </div>
          ) : (
            <Button onClick={() => handleSubmit(blsKey)}>Submit</Button>
          )
        ) : (
          <div className="flex items-center justify-center text-sm gap-1">
            Done <CheckIcon />
          </div>
        )}
      </TableCell>
    </tr>
  )
}

const TableCell = tw.td`px-3 content-center h-14 text-sm text-grey25`
