import { Dialog } from '@headlessui/react'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as CheckGreenIcon } from '@/assets/images/icon-check-green.svg'
import { ReactComponent as DollarGreenIcon } from '@/assets/images/icon-dollar-green.svg'
import { ReactComponent as InfoIcon } from '@/assets/images/info-filled.svg'
import {
  Button,
  ClipboardCopy,
  CompletedTxView,
  ErrorModal,
  Modal,
  ModalDialog,
  Spinner,
  Tooltip
} from '@/components/shared'
import { useMakeRealTxHash, useMint, useNetworkBasedLinkFactories } from '@/hooks'
import { BalanceReportT } from '@/types'
import { handleErr, noty } from '@/utils/global'

import { ReportBalanceSection } from '../Manage'
import styles from './styles.module.scss'

interface IProps {
  open: boolean
  blsPublicKeys: string[]
  liquidStakingManagerAddress?: string
  onMinted: () => void
  onClose: () => void
}

const ModalValidatorMint: FC<IProps> = ({
  open,
  blsPublicKeys,
  liquidStakingManagerAddress,
  onMinted,
  onClose
}) => {
  const navigate = useNavigate()
  const [isMintStep, setMintStep] = useState<boolean>(false)
  const [confirmedKey, setConfirmedKey] = useState(false)
  const [txResult, setTxResult] = useState<any>()
  const [error, setError] = useState<any>()
  const [signatures, setSignatures] = useState<BalanceReportT[]>([])

  const { handleMint, isSubmitting: isMinting } = useMint()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { hash } = useMakeRealTxHash(txResult?.hash)

  const handleClose = (minted?: boolean) => {
    setMintStep(false)
    setConfirmedKey(false)
    setTxResult(undefined)
    setError(undefined)
    minted ? onMinted() : onClose()
  }

  useEffect(() => {
    setMintStep(false)
    setConfirmedKey(false)
  }, [open])

  const handleShowMintModal = () => {
    setMintStep(true)
  }

  const handleIncreaseSubmittedCount = (sig: BalanceReportT) => {
    setSignatures([...signatures, sig])
  }

  const onMint = async () => {
    if (blsPublicKeys.length === 0 || !liquidStakingManagerAddress) return

    try {
      const txResult = await handleMint(liquidStakingManagerAddress, signatures)
      setTxResult(txResult)
    } catch (err) {
      console.log('mint error')
      console.log(err)
      setError(handleErr(err, 'Transaction failed.'))
      noty(handleErr(err, 'Transaction failed.'))
    }
  }

  if (error) {
    return (
      <ErrorModal
        open={open}
        onClose={onClose}
        title="Transaction Error"
        message={error}
        actionButtonContent="Try Again"
        onAction={handleClose}
      />
    )
  }

  if (txResult) {
    return (
      <ModalDialog open={open} onClose={() => handleClose(true)}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLink={makeEtherscanLink(hash)}
          onGoToClick={() => {
            navigate('/')
            handleClose(true)
          }}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300">
                You have successfully minted derivatives.
              </span>
            </div>
          }
        />
      </ModalDialog>
    )
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={() => handleClose()}>
          <CloseCircleIcon />
        </div>
        {!isMintStep ? (
          <>
            <div className="flex flex-col items-center text-white gap-4">
              <InfoIcon />
              <span className="text-lg font-bold">Minting Available</span>
            </div>
            <div className="flex flex-col w-full mt-4 gap-2">
              <VerticalCard>
                <Label className="pl-4 py-2">
                  Report Balance{' '}
                  <Tooltip message="This will confirm your validator effective balance from the consensus layer to the smart contract." />
                </Label>
                <div className="overflow-hidden w-full border rounded-lg border-innerBorder">
                  <table className="w-full table-auto border-collapse">
                    <TableHead>
                      <tr>
                        <TableHeadCell>#</TableHeadCell>
                        <TableHeadCell className="text-left">BLS Key</TableHeadCell>
                        <TableHeadCell></TableHeadCell>
                      </tr>
                    </TableHead>
                    <tbody>
                      {blsPublicKeys.map((blsKey, index) => (
                        <ReportBalanceSection
                          blsKey={blsKey}
                          key={blsKey}
                          index={index}
                          onSubmitted={handleIncreaseSubmittedCount}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </VerticalCard>
              <Card>
                <Label>
                  Mint Tokens{' '}
                  <Tooltip message="You will mint derivatives dETH and SLOT for your validator." />
                </Label>
                <Button
                  className="w-1/3"
                  disabled={signatures.length < blsPublicKeys.length}
                  borderless={true}
                  onClick={handleShowMintModal}>
                  Mint
                </Button>
              </Card>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-white gap-4 mb-3">
              <DollarGreenIcon />
              <span className="text-lg font-bold">Mint your tokens</span>
            </div>
            <div className="flex flex-col text-white w-full gap-6">
              <div className="w-full flex flex-col gap-2">
                {blsPublicKeys.map((blsKey) => (
                  <div key={blsKey} className="break-all text-left">
                    {blsKey}
                    <ClipboardCopy inline={true} copyText={blsKey} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-white font-medium flex items-center gap-4">
                  Confirm Validator Key
                  <Tooltip message="Confirm this is the validator key located in your deposit_data.json and keystore.json files." />
                </div>
                {confirmedKey ? (
                  <div className="w-1/3 flex justify-center items-center gap-2 font-semibold text-primary700 h-11">
                    Done <CheckGreenIcon />
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-1/3"
                    onClick={() => setConfirmedKey(true)}>
                    Confirm
                  </Button>
                )}
              </div>
              {isMinting ? (
                <div className="w-full flex items-center justify-center">
                  <Spinner size={32} />
                </div>
              ) : (
                <Button size="lg" disabled={!confirmedKey} onClick={onMint}>
                  Mint Derivatives
                </Button>
              )}
            </div>
          </>
        )}
      </Dialog.Panel>
    </Modal>
  )
}

const VerticalCard = tw.div`border border-innerBorder rounded-lg flex flex-col gap-2 text-white p-4`
const Card = tw.div`border border-innerBorder rounded-lg flex justify-between text-white py-4 px-8`
const Label = tw.span`flex items-center gap-1`
const TableHead = tw.thead`text-xs text-grey300 bg-[#20202480]`
const TableHeadCell = tw.th`px-3 py-3 font-medium`

export default ModalValidatorMint
