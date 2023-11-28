import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useBalance } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as CheckIcon } from '@/assets/images/icon-check-white.svg'
import { ModalTopUpDETH, RageQuitFooter } from '@/components/app'
import {
  Button,
  ClipboardCopy,
  CompletedTxView,
  DefaultModalView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner,
  TextInput,
  Tooltip
} from '@/components/shared'
import { config } from '@/constants/environment'
import {
  useFacilitatorRageQuit,
  useMakeRealTxHash,
  useNetworkBasedLinkFactories,
  useSDK,
  useUser
} from '@/hooks'
import { bigToNum, convertDateToString, humanReadableAddress, roundNumber } from '@/utils/global'

import client from '../../graphql/client'

type TRageQuitStep = {
  id: number
  title: string
  tooltip: string
  btnLabel: string
  onClick: () => void
}

export const FacilitatorRageQuit = () => {
  const navigate = useNavigate()
  //   const { blsKey } = useParams()
  const { sdk } = useSDK()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  const { facilitateInfo, account } = useUser()

  const blsKey = useMemo(() => facilitateInfo.blsPublicKey ?? '', [facilitateInfo])

  const { data: { formatted: dETHBalance, value: dETHBalanceWei } = {}, refetch } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    token: config.dethTokenAddress as `0x${string}`,
    chainId: config.networkId
  })

  const {
    handleBorrowDETH,
    handleDeployAssistant,
    handleUnstakeETH,
    handleWithdrawValidator,
    handleTopUpDETH,
    setEligible,
    setError,
    setWaitUnstakeModal,
    setFetchAuthenticatedReportError,
    fetchAuthenticatedReport,
    setUnstakable,
    setCurrentStep,
    setTopUpRequired,
    handleTopUpSlashedSlot,
    isUnstakable,
    currentStep,
    extraStep,
    error,
    fetchAuthenticatedReportError,
    isLoading,
    firstLoading,
    txHash,
    eligible,
    requiredDETH,
    waitUnstakeModal,
    topUpRequired,
    loadingTopup
  } = useFacilitatorRageQuit(blsKey)

  const { hash } = useMakeRealTxHash(txHash)

  const [openDepositModal, setOpenDepositModal] = useState(false)
  const [values, setValues] = useState<any>({})
  const [dETHAmount, setDETHAmount] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [goNextStep, setGoNextStep] = useState<boolean>(false)

  const fetchValues = useCallback(async () => {
    if (sdk && blsKey) {
      const ethToSupply = await sdk.utils.calculateExitFee(blsKey)
      setValues({
        ethToSupply
      })
    }
  }, [sdk, blsKey])

  useEffect(() => {
    fetchValues()
  }, [fetchValues])

  useEffect(() => {
    if (currentStep == 2 && facilitateInfo.borrowFundsAvailable == true) {
      setCurrentStep(3)
    }
  }, [currentStep])

  useEffect(() => {
    if (currentStep == 2) handleBorrowDETH()
  }, [currentStep])

  useEffect(() => {
    if (requiredDETH?.eq(BigNumber.from('0')) && currentStep == 2) {
      setCurrentStep(3)
    }
  }, [currentStep, requiredDETH])

  const maxBalance = useMemo(
    () =>
      Number(formatEther(requiredDETH?.toString() ?? '0')) > Number(dETHBalance)
        ? dETHBalanceWei
        : requiredDETH,
    [requiredDETH, dETHBalance]
  )

  useEffect(() => {
    if (Number(dETHAmount) > Number(formatEther(maxBalance ?? 0)))
      setErrorMsg(`Please input less than ${formatEther(maxBalance ?? 0)}`)
    else setErrorMsg('')
  }, [dETHAmount, maxBalance])

  const handleTopUp = async () => {
    if (Number(dETHAmount) >= Number(formatEther(requiredDETH?.toString() ?? '0')))
      setGoNextStep(true)
    await handleTopUpDETH(dETHAmount)
    if (Number(dETHAmount) >= Number(formatEther(requiredDETH?.toString() ?? '0')))
      setCurrentStep(3)
    setOpenDepositModal(false)
  }

  const RAGE_QUIT_STEPS: TRageQuitStep[] = [
    {
      id: 1,
      title: 'Deploy Virtual Assistant',
      tooltip:
        'The Withdrawal Assistant will help to gather all required derivatives to withdraw your validator.',
      btnLabel: 'Confirm',
      onClick: handleDeployAssistant
    },
    {
      id: 2,
      title: 'Borrow dETH',
      tooltip: 'Borrow the dETH required to burn and withdraw your validator.',
      btnLabel: 'Submit',
      onClick: handleTopUp
    },
    {
      id: 3,
      title: 'Withdraw Validator',
      tooltip: 'This will remove your KNOT and burn your derivatives associated with Stakehouse.',
      btnLabel: 'Confirm',
      onClick: handleWithdrawValidator
    },
    {
      id: 4,
      title: 'Unstake ETH',
      tooltip: 'This will remove your KNOT and burn your derivatives associated with Stakehouse.',
      btnLabel: 'Confirm',
      onClick: handleUnstakeETH
    }
  ]

  const handleCloseSuccessModal = () => {
    navigate('/')
  }

  const handleRefetchReportBalance = () => {
    fetchAuthenticatedReport()
    setFetchAuthenticatedReportError(false)
  }

  const totalTopupRequired = useMemo(() => {
    if (topUpRequired.length > 0) {
      let result = 0
      topUpRequired.forEach(({ amount }) => {
        result += bigToNum(amount)
      })
      return result
    }

    return 0
  }, [topUpRequired])

  return (
    <div className="w-full flex-1">
      <div className="max-w-xl w-full mx-auto mt-10 rounded-2xl bg-grey850 p-4 mb-4">
        <Title>
          <div>
            <img
              src={ArrowLeftSVG}
              className="icon-left-arrow absolute left-0 ml-2"
              onClick={() => navigate(-1)}
            />
            Validator rage quit
          </div>
          <div className="flex items-center gap-2 text-sm">
            {humanReadableAddress(blsKey)} <ClipboardCopy copyText={blsKey} />
          </div>
        </Title>

        {RAGE_QUIT_STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex justify-between items-center px-6 py-4 border border-border mb-2 rounded-lg ${
              currentStep === step.id && 'bg-grey900'
            } ${step.id === 2 && 'flex-col gap-3'}`}>
            {step.id === 2 ? (
              <div className="flex justify-between items-center w-full">
                <p
                  className={`flex gap-2 ${
                    currentStep === step.id ? 'text-primary' : 'text-grey400'
                  }`}>
                  {step.title} <Tooltip message={step.tooltip} />
                </p>
                <div className="flex flex-col items-end gap-2.5">
                  {currentStep > step.id ? (
                    <div className="flex w-32 text-white items-center justify-center text-sm gap-1">
                      Done <CheckIcon />
                    </div>
                  ) : extraStep ? (
                    <Button
                      className="w-32"
                      onClick={() => {
                        if (!goNextStep) navigate('/manage/facilitator')
                        else setCurrentStep(3)
                      }}>
                      {!goNextStep ? 'Home' : 'Continue'}
                    </Button>
                  ) : (
                    <Button
                      className="w-32"
                      disabled={
                        currentStep < step.id ||
                        isLoading ||
                        errorMsg.length > 0 ||
                        !Number(dETHAmount)
                      }
                      onClick={step.onClick}>
                      {isLoading && currentStep === step.id ? (
                        <div className="flex justify-center">
                          <Spinner size={24} />
                        </div>
                      ) : (
                        step.btnLabel
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p
                  className={`flex gap-2 ${
                    currentStep === step.id ? 'text-primary' : 'text-grey400'
                  }`}>
                  {step.title} <Tooltip message={step.tooltip} />
                </p>
                <div className="flex flex-col items-end gap-2.5">
                  {currentStep > step.id ? (
                    <div className="flex w-32 text-white items-center justify-center text-sm gap-1">
                      Done <CheckIcon />
                    </div>
                  ) : (
                    <Button
                      className="w-32"
                      disabled={currentStep < step.id || isLoading}
                      onClick={step.onClick}>
                      {isLoading && currentStep === step.id ? (
                        <div className="flex justify-center">
                          <Spinner size={24} />
                        </div>
                      ) : (
                        step.btnLabel
                      )}
                    </Button>
                  )}
                  {step.id === 3 && (
                    <span className="text-grey600 text-sm">
                      ETH to Supply:{' '}
                      {values?.ethToSupply ? roundNumber(bigToNum(values.ethToSupply), 2) : 0} ETH
                    </span>
                  )}
                </div>
              </>
            )}
            {step.id === 2 && (
              <>
                <div className="relative w-full flex items-center">
                  <input
                    value={dETHAmount}
                    disabled={step.id !== 2}
                    onChange={(event) => setDETHAmount(event.target.value)}
                    className="text-white px-4 py-2 leading-6 border border-solid outline-none w-full placeholder-grey300 border-grey500 rounded-lg bg-grey200"
                    placeholder="Please input dETH amount..."
                  />
                  <button
                    className="absolute right-2 p-1.5 bg-primary bg-opacity-10 rounded-lg"
                    onClick={() => setDETHAmount(formatEther(maxBalance ?? 0))}>
                    <p className="text-xs font-medium text-primary700">MAX</p>
                  </button>
                </div>
                <div className="text-sm text-error w-full text-left">{errorMsg && errorMsg}</div>
              </>
            )}
          </div>
        ))}
      </div>
      <RageQuitFooter values={values} />
      <ModalDialog open={!!txHash} onClose={handleCloseSuccessModal}>
        <CompletedTxView
          goToContent="Claim"
          title="Success"
          txLink={makeEtherscanLink(hash)}
          onGoToClick={() => navigate('/manage/withdraw')}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300 mb-2" style={{ wordBreak: 'break-word' }}>
                {`You've successfully unstaked your ETH from the validator. ${blsKey}`}
              </span>
            </div>
          }
        />
      </ModalDialog>
      <ModalDialog
        open={waitUnstakeModal > 0}
        onClose={() => setWaitUnstakeModal(0)}
        controlsClosableOnly>
        <DefaultModalView title="Withdrawal in Progress">
          <div className="flex flex-col items-center">
            <p className="text-primary font-semibold mb-5">Your withdrawal process has started</p>
            <p className="text-grey700 font-medium text-center mb-8">
              {`You'll need to continue running your validator`}
              <br /> during the withdrawal queue.
            </p>
            <p className="text-grey700 font-medium mb-2">Estimated time remaining</p>
            <p className="text-white text-2xl font-medium mb-2">
              {waitUnstakeModal ? convertDateToString(waitUnstakeModal) : '-- : -- : --'}
            </p>
          </div>
        </DefaultModalView>
      </ModalDialog>
      <ModalDialog
        open={topUpRequired.length > 0}
        onClose={() => setTopUpRequired([])}
        controlsClosableOnly>
        <DefaultModalView
          title="Topup Validators"
          message={`Some validators in the stakehouse require a total topup of ${
            totalTopupRequired ?? 0
          } ETH before you can exit. Please continue if you wish to topup for each validator and exit.`}>
          <div className="flex items-center w-full justify-center gap-2.5">
            <Button
              size="lg"
              disabled={loadingTopup}
              onClick={() => {
                handleTopUpSlashedSlot()
              }}>
              Continue
            </Button>
          </div>
        </DefaultModalView>
      </ModalDialog>
      <ModalDialog open={!eligible} onClose={() => setEligible(true)} controlsClosableOnly>
        <DefaultModalView
          title="Eligibility Status"
          message={`There are not enough dETH available to borrow. You will need to deposit ${
            requiredDETH ? bigToNum(requiredDETH) : 0
          } dETH to continue the process.`}>
          <div className="flex items-center w-full justify-center gap-2.5">
            <Button
              size="lg"
              onClick={() => {
                setOpenDepositModal(true)
                setEligible(true)
              }}>
              Top Up dETH
            </Button>
          </div>
        </DefaultModalView>
      </ModalDialog>
      <LoadingModal open={firstLoading} onClose={() => {}} title="" />
      {/* <ModalTopUpDETH
        open={openDepositModal}
        amount={requiredDETH}
        loading={isLoading}
        onClose={() => setOpenDepositModal(false)}
        onSubmit={handleTopUp}
      /> */}
      <ErrorModal
        open={!!error}
        onClose={() => setError('')}
        message={error}
        title="Error"
        actionButtonContent="Try Again"
        onAction={() => setError('')}
      />
      <ErrorModal
        open={fetchAuthenticatedReportError}
        onClose={handleRefetchReportBalance}
        message={'Something went wrong while fetching authenticated report.'}
        title="Error"
        actionButtonContent="Try Again"
        onAction={handleRefetchReportBalance}
      />
      <ErrorModal
        open={isUnstakable}
        onClose={() => setUnstakable(false)}
        message={
          'Withdrawal to Stakehouse Protocol not yet complete by Consensus Layer. Please try again later'
        }
        title="Error"
        actionButtonContent="Ok"
        onAction={() => setUnstakable(false)}
      />
    </div>
  )
}

const Title = styled.div`
  ${tw`font-semibold flex flex-col gap-5 items-center text-white justify-center relative text-3xl mb-8`}
  .icon-left-arrow {
    ${tw`w-6 h-6 cursor-pointer`}
  }
`
