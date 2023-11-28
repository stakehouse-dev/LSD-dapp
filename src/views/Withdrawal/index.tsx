import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import {
  Button,
  ClipboardCopy,
  Dropzone,
  ErrorModal,
  LoadingModal,
  TextInput,
  Tooltip
} from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { useSDK } from '@/hooks'
import { KeystoreT } from '@/types'
import { humanReadableAddress, parseFileAsJson } from '@/utils/global'
import { handleErr } from '@/utils/global'

interface PasswordValidationT {
  required?: string | undefined
  length?: string | undefined
}

export const Withdrawal = () => {
  const navigate = useNavigate()
  const { blsKey } = useParams()
  const { sdk } = useSDK()

  const [error, setError] = useState('')
  const [keystoreFile, setKeystoreFile] = useState<File>()
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [passwordValidationErr, setPasswordValidationErr] = useState<PasswordValidationT>()

  const handleUploadFile = async (file: File) => {
    const keystore = await parseFileAsJson<KeystoreT>(file)
    if (`0x${keystore.pubkey}` !== blsKey) {
      return setError('Please make sure to upload correct keystore file.')
    }
    setKeystoreFile(file)
  }

  const handleCloseErrorModal = () => {
    setError('')
    setKeystoreFile(undefined)
  }

  useEffect(() => {
    if (!confirmPassword) {
      return setPasswordValidationErr({ required: 'Password is required' })
    } else if (confirmPassword.length < 8) {
      return setPasswordValidationErr({ length: 'Your password must be 8 or more characters.' })
    } else {
      setPasswordValidationErr(undefined)
    }
  }, [confirmPassword])

  const handleConfirm = async () => {
    if (!sdk || !keystoreFile) return

    setConfirming(true)
    try {
      const stringValue = localStorage.getItem('ragequit')

      let ragequit
      if (stringValue) {
        ragequit = JSON.parse(stringValue)
        if (ragequit.includes(blsKey)) {
          setConfirming(false)
          navigate('status')
          return
        }
      }

      const keystore = await parseFileAsJson<KeystoreT>(keystoreFile)
      await sdk.withdrawal.broadcastVoluntaryWithdrawal(BEACON_NODE_URL, keystore, confirmPassword)

      if (ragequit) {
        ragequit = [...ragequit, blsKey]
      } else {
        ragequit = [blsKey]
      }
      localStorage.setItem('ragequit', JSON.stringify(ragequit))
      setConfirming(false)
      navigate('status')
    } catch (err) {
      console.log('broadcastVoluntaryWithdrawal error: ', err)
      setConfirming(false)
      setTimeout(
        () =>
          setError(handleErr(err, 'Please ensure the password and validator file are correct.')),
        500
      )
      return
    }
  }

  return (
    <div className="w-full flex-1">
      <div className="max-w-xl w-full mx-auto mt-10 rounded-2xl bg-grey850 p-4 mb-4">
        <Title>
          <img
            src={ArrowLeftSVG}
            className="icon-left-arrow absolute left-0 ml-2"
            onClick={() => navigate(-1)}
          />
          Validator Withdrawal
        </Title>
        <div className="flex flex-col p-4 border border-border mb-2 rounded-lg bg-grey900">
          <div className="flex gap-2 text-grey400 py-4">
            <p className="text-white font-medium">Confirm your keystore file </p>
            <Tooltip message="Confirming your keystore file is required for validator withdrawals." />
          </div>
          <div className="overflow-hidden w-full border border-innerBorder rounded-lg mb-6">
            <table className="w-full table-auto border-collapse">
              <TableHead>
                <tr className="border-b border-innerBorder">
                  <TableHeadCell>#</TableHeadCell>
                  <TableHeadCell>BLS Key</TableHeadCell>
                  <TableHeadCell>Keystore file</TableHeadCell>
                </tr>
              </TableHead>
              <tbody>
                <tr>
                  <TableCell>1</TableCell>
                  <TableCell>
                    <ClipboardCopy copyText={blsKey || ''}>
                      {humanReadableAddress(blsKey || '', 15)}
                    </ClipboardCopy>
                  </TableCell>
                  <TableCell>
                    <Dropzone
                      uploadedFile={keystoreFile}
                      onChange={(file) => handleUploadFile(file)}
                      size="sm"
                      noStyle
                      onClear={() => setKeystoreFile(undefined)}
                    />
                  </TableCell>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col w-full gap-2 mb-4">
            <TextInput
              label="Enter Keystore Password"
              type="password"
              className="py-2 px-3.5 rounded-lg border border-grey500 bg-black text-white text-base"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordValidationErr?.required && (
              <span className="text-error text-xs text-left">{passwordValidationErr.required}</span>
            )}
            {passwordValidationErr?.length && (
              <span className="text-error text-xs text-left">{passwordValidationErr.length}</span>
            )}
          </div>
          <Button
            variant="primary"
            className="w-full h-12"
            disabled={!confirmPassword || confirming || !!passwordValidationErr || !keystoreFile}
            onClick={handleConfirm}>
            Confirm
          </Button>
          <LoadingModal open={confirming} title="Confirmation Pending" onClose={() => {}} />
        </div>
      </div>
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

const Title = styled.div`
  ${tw`font-semibold flex gap-5 items-center text-white justify-center relative text-3xl mb-8`}
  .icon-left-arrow {
    ${tw`w-6 h-6 cursor-pointer`}
  }
`

const TableHead = tw.thead`text-xs text-grey300`
const TableHeadCell = tw.th`px-3 py-3 font-medium text-left`
const TableCell = tw.td`px-3 content-center h-14 text-white text-sm`
