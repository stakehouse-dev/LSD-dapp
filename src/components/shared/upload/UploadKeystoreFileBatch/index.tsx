import { useEffect, useState } from 'react'
import tw from 'twin.macro'

import { ClipboardCopy, Dropzone, ErrorModal } from '@/components/shared'
import { KeystoreDataItem, KeystoreT } from '@/types'
import { humanReadableAddress, parseFileAsJson } from '@/utils/global'

interface UploadKeystoreFileBatchProps {
  blsKeys: string[]
  onAllUploaded: (data: KeystoreDataItem[]) => void
  onDeleteFile: () => void
}

export const UploadKeystoreFileBatch = ({
  blsKeys,
  onAllUploaded,
  onDeleteFile
}: UploadKeystoreFileBatchProps) => {
  const [error, setError] = useState('')
  const [justUploadedFileKey, setJustUploadedFileKey] = useState('')
  const [uploadedKeystoreFiles, setUploadedKeystoreFiles] = useState<KeystoreDataItem[]>([])

  const handleUploadFile = async (file: File, blsKey: string) => {
    const updatedFiles = [
      ...uploadedKeystoreFiles.filter((file) => file.blsKey !== blsKey),
      { blsKey, keystoreFile: file }
    ]
    setJustUploadedFileKey(blsKey)
    setUploadedKeystoreFiles(updatedFiles)

    const keystore = await parseFileAsJson<KeystoreT>(file)
    if (`0x${keystore.pubkey}` !== blsKey) {
      return setError('Please make sure to upload correct keystore file.')
    }

    if (blsKeys.length > 0 && updatedFiles.length === blsKeys.length) {
      onAllUploaded(updatedFiles)
    }
  }

  const handleRemoveKeystoreFile = (blsKey: string) => {
    setUploadedKeystoreFiles(uploadedKeystoreFiles.filter((file) => file.blsKey !== blsKey))
    onDeleteFile()
  }

  const handleCloseErrorModal = () => {
    setError('')
    handleRemoveKeystoreFile(justUploadedFileKey)
    setJustUploadedFileKey('')
  }

  return (
    <div className="overflow-hidden w-full border rounded-lg border-innerBorder">
      <table className="w-full table-auto border-collapse">
        <TableHead>
          <tr>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>BLS Key</TableHeadCell>
            <TableHeadCell>Keystore file</TableHeadCell>
          </tr>
        </TableHead>
        <tbody>
          {blsKeys.map((blsKey, idx) => (
            <tr key={blsKey} className="border-t border-innerBorder text-sm font-medium">
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <ClipboardCopy copyText={blsKey}>{humanReadableAddress(blsKey, 9)}</ClipboardCopy>
              </TableCell>
              <TableCell>
                <Dropzone
                  uploadedFile={
                    uploadedKeystoreFiles.find((file) => file.blsKey === blsKey)?.keystoreFile
                  }
                  onChange={(file) => handleUploadFile(file, blsKey)}
                  size="sm"
                  noStyle
                  onClear={() => handleRemoveKeystoreFile(blsKey)}
                />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
      <ErrorModal
        open={!!error}
        onClose={handleCloseErrorModal}
        title="Error"
        message={error}
        actionButtonContent="Try Again"
        onAction={handleCloseErrorModal}
      />
    </div>
  )
}

const TableHead = tw.thead`text-xs text-grey300 bg-[#20202480]`
const TableHeadCell = tw.th`px-3 py-3 font-medium`
const TableCell = tw.td`px-3 content-center h-14 text-sm text-grey25`
