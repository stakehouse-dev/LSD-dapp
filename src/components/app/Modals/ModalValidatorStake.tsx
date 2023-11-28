import { Dialog } from '@headlessui/react'
import { ethers } from 'ethers'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import tw from 'twin.macro'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as CheckIcon } from '@/assets/images/icon-check-white.svg'
import { ReactComponent as InfoIcon } from '@/assets/images/info-filled.svg'
import {
  Button,
  CompletedTxView,
  ErrorModal,
  Modal,
  ModalDialog,
  Spinner,
  TextInput,
  UploadKeystoreFileBatch,
  ValidatorRegisterCard
} from '@/components/shared'
import {
  useCustomAccount,
  useGetETH,
  useMakeRealTxHash,
  useNetworkBasedLinkFactories,
  useSDK,
  useStake
} from '@/hooks'
import { KeystoreDataItem, KeystoreT, TFunds, TLSDValidator } from '@/types'
import { handleErr, notifyHash, noty, parseFileAsJson } from '@/utils/global'

import styles from './styles.module.scss'

interface IProps {
  open: boolean
  blsPublicKeys: TLSDValidator[]
  liquidStakingManagerAddress: string
  onStaked: () => void
  onClose: () => void
}

interface PasswordValidationT {
  required?: string | undefined
  length?: string | undefined
}

const ModalValidatorStake: FC<IProps> = ({
  open,
  blsPublicKeys,
  liquidStakingManagerAddress,
  onStaked,
  onClose
}) => {
  const [step, setStep] = useState<number>(1)
  const [firstStep, setFirstStep] = useState<number>(1)
  const [keystoreObjects, setKeystoreObjects] = useState<KeystoreT[]>([])
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordValidationErr, setPasswordValidationErr] = useState<PasswordValidationT>()
  const [txResult, setTxResult] = useState<any>()
  const [error, setError] = useState<any>()
  const [updatedFunds, setUpdatedFunds] = useState<TFunds[]>([])

  const { handleGetFeesMevETH, handleGetSavETH, isLoading: isGettingEth, setLoading } = useGetETH()
  const { handleApproveStake, isLoading: isApproving, setLoading: setApproving } = useStake()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { sdk } = useSDK()

  const { hash } = useMakeRealTxHash(txResult?.hash)
  const { isGnosis } = useCustomAccount()

  const fetchFunds = useCallback(async () => {
    if (blsPublicKeys.length > 0 && sdk) {
      try {
        const keys = blsPublicKeys.map((key) => key.id)
        const funds = await sdk.wizard.batchCalculateFundsRequiredForStaking(keys)
        const convertedFunds = funds.map((fund: any) => ({
          savETH: Number(ethers.utils.formatEther(ethers.BigNumber.from(fund.savETH))),
          feesAndMEV: Number(ethers.utils.formatEther(ethers.BigNumber.from(fund.feesAndMEV)))
        }))
        setUpdatedFunds(convertedFunds)
      } catch (err) {
        console.log('something wrong when calculating funds')
      }
    }
  }, [blsPublicKeys, sdk])

  useEffect(() => {
    fetchFunds()
  }, [fetchFunds])

  useEffect(() => {
    if (!confirmPassword) {
      return setPasswordValidationErr({ required: 'Password is required' })
    } else if (confirmPassword.length < 8) {
      return setPasswordValidationErr({ length: 'Your password must be 8 or more characters.' })
    } else {
      setPasswordValidationErr(undefined)
    }
  }, [confirmPassword])

  const totalUpdatedRequiredSavETH = useMemo(() => {
    if (updatedFunds.length > 0) {
      let sum = 0
      updatedFunds.forEach((fund) => {
        sum += fund.savETH
      })
      return sum
    }

    return 0
  }, [updatedFunds])
  const totalUpdatedRequiredFeeMevETH = useMemo(() => {
    if (updatedFunds.length > 0) {
      let sum = 0
      updatedFunds.forEach((fund) => {
        sum += fund.feesAndMEV
      })
      return sum
    }

    return 0
  }, [updatedFunds])

  useEffect(() => {
    if (totalUpdatedRequiredSavETH !== 0) {
      setFirstStep(1)
    } else if (totalUpdatedRequiredSavETH === 0 && totalUpdatedRequiredFeeMevETH !== 0) {
      setFirstStep(2)
    } else if (totalUpdatedRequiredSavETH === 0 && totalUpdatedRequiredFeeMevETH === 0) {
      setFirstStep(3)
    }
  }, [totalUpdatedRequiredSavETH, totalUpdatedRequiredFeeMevETH])

  const handleUploadedAll = async (data: KeystoreDataItem[]) => {
    const keystores = await Promise.all(
      data
        .filter((item) => !!item.keystoreFile)
        .map((item) => parseFileAsJson<KeystoreT>(item.keystoreFile!))
    )
    setKeystoreObjects(keystores)
  }

  const handleApprove = async () => {
    try {
      const result = await handleApproveStake(
        confirmPassword,
        keystoreObjects,
        blsPublicKeys.map((key) => key.id),
        liquidStakingManagerAddress
      )
      if (result) {
        if (!isGnosis) notifyHash(result.hash)
        await result.wait()
        setTxResult(result)
      } else {
        noty('Please ensure the password and validator file are correct.')
        setError('Please ensure the password and validator file are correct.')
      }
    } catch (err) {
      console.log('approve err: ', err)
      setError(handleErr(err))
    }
    setApproving(false)
  }

  const handleGetETH = async (funds: number[], type: 'sav' | 'fees') => {
    let txResult

    if (funds.length !== blsPublicKeys.length) {
      return handleErr({ message: 'The given data is not correct' })
    }

    const filteredFunds: number[] = []
    const filteredBlsKeys: string[] = []
    funds.forEach((fund, idx) => {
      if (fund > 0) {
        filteredFunds.push(fund)
        filteredBlsKeys.push(blsPublicKeys[idx].id)
      }
    })

    try {
      if (type === 'sav') {
        txResult = await handleGetSavETH(
          filteredBlsKeys,
          liquidStakingManagerAddress,
          filteredFunds
        )
      } else {
        txResult = await handleGetFeesMevETH(
          filteredBlsKeys,
          liquidStakingManagerAddress,
          filteredFunds
        )
      }
    } catch (err) {
      console.log('get eth error: ', err)
      handleErr(err)
    }

    if (txResult) {
      if (!isGnosis) notifyHash(txResult.hash)
      await txResult.wait()
      await fetchFunds()
      setLoading(false)
    } else {
      setLoading(false)
    }
    setLoading(false)
  }

  const handleClear = () => {
    setStep(1)
    setKeystoreObjects([])
    setConfirmPassword('')
    setTxResult(undefined)
    setError(undefined)
    setUpdatedFunds([])
  }

  const handleClose = () => {
    handleClear()
    onClose()
  }

  const handleStaked = () => {
    handleClear()
    onStaked()
  }

  if (error) {
    return (
      <ErrorModal
        open={open}
        onClose={handleClose}
        title="Transaction Error"
        message={error}
        actionButtonContent="Try Again"
        onAction={handleClear}
      />
    )
  }

  if (txResult) {
    return (
      <ModalDialog open={open} onClose={handleClose}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLink={makeEtherscanLink(hash)}
          onGoToClick={handleStaked}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300">
                You have successfully staked your validator
              </span>
              <span className="text-sm text-grey300">with the Ethereum deposit contract.</span>
            </div>
          }
        />
      </ModalDialog>
    )
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Dialog.Panel className={styles.modalLayoutBig}>
        <div className="absolute top-3 right-3 cursor-pointer" onClick={handleClose}>
          <CloseCircleIcon />
        </div>

        <div className="flex flex-col items-center text-white gap-4">
          <InfoIcon />
          <span className="text-lg font-bold">Confirmation</span>
        </div>
        <div className="flex flex-col w-full mt-4 gap-2">
          <ValidatorRegisterCard
            active={step === 1}
            done={step === 2}
            stepNum={1}
            title="Confirm your Keystore file"
            tooltip="Make sure you are uploading the correct validator signing key.">
            <UploadKeystoreFileBatch
              blsKeys={blsPublicKeys.map((pubKey) => pubKey.id)}
              onAllUploaded={handleUploadedAll}
              onDeleteFile={() => setKeystoreObjects([])}
            />
            <form
              className="flex flex-col w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                setStep(2)
              }}>
              <TextInput
                label="Confirm Keystore Password"
                type="password"
                disabled={keystoreObjects.length < blsPublicKeys.length}
                className={styles.input}
                tooltip="Without this password, you will not be able to stake and run your validator."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordValidationErr?.required && (
                <span className={styles.inputErr}>{passwordValidationErr.required}</span>
              )}
              {passwordValidationErr?.length && (
                <span className={styles.inputErr}>{passwordValidationErr.length}</span>
              )}
              <span className="text-primary text-sm text-left">
                Ensure the password is correct or else the transaction will fail.
              </span>
              <Button
                variant="primary"
                className="h-12 w-full"
                disabled={!confirmPassword || keystoreObjects.length < blsPublicKeys.length}
                onClick={() => setStep(2)}>
                Confirm
              </Button>
            </form>
          </ValidatorRegisterCard>
          <ValidatorRegisterCard
            active={step === 2}
            done={step === 3}
            stepNum={2}
            title={`Fund ${28 * blsPublicKeys.length} ETH for your validator`}
            tooltip={`Fund ${28 * blsPublicKeys.length} ETH for your validator`}>
            <div className="flex flex-col gap-2 w-full">
              <Card>
                {firstStep === 1 ? (
                  <>
                    <span>You need {totalUpdatedRequiredSavETH} more ETH in savETH pool.</span>
                    <Button
                      disabled={isGettingEth}
                      onClick={() =>
                        handleGetETH(
                          updatedFunds.map((fund) => fund.savETH),
                          'sav'
                        )
                      }>
                      Get ETH
                    </Button>
                  </>
                ) : (
                  <>
                    <span>Fund {blsPublicKeys.length * 24} ETH for your validator</span>
                    <div className="flex items-center justify-center text-sm gap-1">
                      Done <CheckIcon />
                    </div>
                  </>
                )}
              </Card>
              <Card>
                {firstStep <= 2 ? (
                  <>
                    <span className={`${totalUpdatedRequiredSavETH > 0 && 'text-grey500'}`}>
                      You need {totalUpdatedRequiredFeeMevETH} more ETH in Fees & MEV pool.
                    </span>
                    <Button
                      disabled={firstStep === 1 || isGettingEth}
                      onClick={() =>
                        handleGetETH(
                          updatedFunds.map((fund) => fund.feesAndMEV),
                          'fees'
                        )
                      }>
                      Get ETH
                    </Button>
                  </>
                ) : (
                  <>
                    <span>Fund {blsPublicKeys.length * 4} ETH for your validator</span>
                    <div className="flex items-center justify-center text-sm gap-1">
                      Done <CheckIcon />
                    </div>
                  </>
                )}
              </Card>
              {isApproving ? (
                <div className="w-full flex justify-center items-center mt-4">
                  <Spinner size={30} />
                </div>
              ) : (
                <Button
                  size="lg"
                  disabled={keystoreObjects.length === 0 || !confirmPassword || firstStep < 3}
                  onClick={handleApprove}>
                  Approve Transaction
                </Button>
              )}
            </div>
          </ValidatorRegisterCard>
        </div>
      </Dialog.Panel>
    </Modal>
  )
}

const Card = tw.div`border border-innerBorder rounded-lg flex items-center justify-between text-sm text-white py-4 px-2 pr-3`

export default ModalValidatorStake
