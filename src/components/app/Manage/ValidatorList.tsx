import tw from 'twin.macro'

import { ClipboardCopy } from '@/components/shared'
import { humanReadableAddress } from '@/utils/global'

interface ValidatorListProps {
  blsKeys: string[]
}

export const ValidatorList = ({ blsKeys }: ValidatorListProps) => {
  return (
    <div className="overflow-hidden w-full border rounded-lg border-innerBorder">
      <table className="w-full table-auto border-collapse">
        <TableHead>
          <tr>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>BLS Key</TableHeadCell>
          </tr>
        </TableHead>
        <tbody>
          {blsKeys.map((blsKey, idx) => (
            <tr key={blsKey} className="border-t border-innerBorder text-sm font-medium">
              <TableCell>{idx + 1}</TableCell>
              <TableCell className="flex justify-center">
                <ClipboardCopy copyText={blsKey}>{humanReadableAddress(blsKey, 9)}</ClipboardCopy>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TableHead = tw.thead`text-xs text-grey300 bg-[#20202480]`
const TableHeadCell = tw.th`px-3 py-3 font-medium`
const TableCell = tw.td`px-3 content-center h-14 text-sm text-grey25 text-center`
