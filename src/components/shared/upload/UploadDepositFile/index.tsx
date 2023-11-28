import { FC, ReactNode, useEffect, useState } from 'react'
import tw from 'twin.macro'
import { useBalance } from 'wagmi'

import { ReactComponent as TrashIcon } from '@/assets/images/icon-trash.svg'
import { config } from '@/constants/environment'
import { useCustomAccount } from '@/hooks'
import { DepositObjectT } from '@/types'
import { humanReadableAddress, parseFileAsJson } from '@/utils/global'

import Button from '../../Buttons'
import ClipboardCopy from '../../ClipboardCopy'
import Dropzone from '../../Dropzone'
import { ErrorModal } from '../../Modal/ErrorModal'
import { Tooltip } from '../../Tooltip'

export interface UploadDepositFileProps {
  onUploaded: (depositObject: DepositObjectT) => void
  disabled?: boolean
  tooltip?: ReactNode
  onClear?: () => void
}

const TableRow = ({ id, deposit }: { id: number; deposit: DepositObjectT }) => {
  const blsKey = deposit[0]?.pubkey

  return (
    <tr className="border-t border-innerBorder text-sm font-medium">
      <TableCell>{id}</TableCell>
      <TableCell>
        <ClipboardCopy copyText={blsKey}>{humanReadableAddress(blsKey, 35)}</ClipboardCopy>
      </TableCell>
    </tr>
  )
}

export const UploadDepositFile: FC<UploadDepositFileProps> = ({
  onUploaded,
  disabled,
  tooltip,
  onClear = () => {}
}) => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState<string>()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [depositObject, setDepositObject] = useState<DepositObjectT>()

  const { account } = useCustomAccount()
  const address = account?.address

  const { data: { formatted: balance } = {} } = useBalance({
    address: address,
    formatUnits: 'ether',
    chainId: config.networkId
  })

  const handleUploadFile = async (_file: File, handleClear: (() => void) | undefined) => {
    if (!_file || !_file.name.startsWith('deposit_data')) {
      setErrorModalMessage('Invalid file. Please upload the deposit_data.json!')
      setIsErrorModalOpen(true)
      if (handleClear) {
        handleClear()
      }
      return
    }
    setUploadedFile(_file)
    try {
      const depositObject = await parseFileAsJson<DepositObjectT>(_file)
      if (Number(balance) < depositObject.length * 4) {
        setErrorModalMessage("You don't have enough ETH to deposit validators.")
        return setIsErrorModalOpen(true)
      }

      setDepositObject(depositObject)
    } catch (err) {
      console.log('convert deposit file error: ', err)
    }
  }

  const handleConfirmUpload = async () => {
    if (!depositObject) return

    onUploaded(depositObject)
  }

  const handleUploadedFileClear = () => {
    setUploadedFile(null)
    setDepositObject(undefined)
    onClear()
  }

  return (
    <>
      {uploadedFile && (
        <div className="absolute right-3 top-2.5">
          <Button variant="secondary" onClick={handleUploadedFileClear}>
            <div className="flex items-center gap-2.5">
              <TrashIcon />
              <span className="text-sm text-white">Clear</span>
            </div>
          </Button>
        </div>
      )}
      {depositObject ? (
        <div className="border border-innerBorder rounded-lg overflow-hidden w-full">
          <table className="w-full table-auto">
            <TableHead>
              <tr>
                <TableHeadCell>#</TableHeadCell>
                <TableHeadCell>
                  <Label>BLS Key</Label>
                </TableHeadCell>
              </tr>
            </TableHead>
            <tbody>
              {depositObject.map((deposit, index) => {
                return <TableRow deposit={[deposit]} id={index + 1} key={index} />
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Dropzone
          uploadedFile={uploadedFile}
          onChange={handleUploadFile}
          disabled={disabled}
          size="sm"
          onClear={handleUploadedFileClear}>
          <div className="flex items-center gap-2">
            <div>
              Drag and drop your <strong>deposit_data.json</strong> file
            </div>
            <Tooltip message={tooltip} />
          </div>
        </Dropzone>
      )}
      {uploadedFile && (
        <Button className="w-full" onClick={handleConfirmUpload}>
          Continue
        </Button>
      )}
      <ErrorModal
        open={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Ooops!"
        message={errorModalMessage}
        actionButtonContent="Try again"
        onAction={() => setIsErrorModalOpen(false)}
      />
    </>
  )
}

const TableHead = tw.thead`text-xs font-medium text-grey300 bg-[#20202480]`
const TableHeadCell = tw.th`px-6 py-3`
const Label = tw.div`flex items-center gap-2`
const TableCell = tw.td`px-6 content-center h-12`
