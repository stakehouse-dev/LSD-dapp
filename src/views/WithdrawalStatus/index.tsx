import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ModalConfirmExitValidator } from '@/components/app'
import {
  Button,
  DefaultModalView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner,
  Tooltip
} from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { getStakehouseAccount } from '@/graphql/queries/lsdValidators'
import { NodeRunnerByValidatorQuery } from '@/graphql/queries/NodeRunnersQuery'
import { useReportBalance, useSDK } from '@/hooks'
import { BalanceReportT } from '@/types'
import { convertDateToString, handleErr } from '@/utils/global'

export const WithdrawalStatus = () => {
  const { sdk } = useSDK()
  const navigate = useNavigate()
  const { blsKey } = useParams()
  const { handleSubmit, handleReset, signature, isSubmitting, isSubmitted } = useReportBalance()

  const { data: { stakehouseAccount } = {} } = useQuery(getStakehouseAccount, {
    variables: { blsPublicKey: blsKey },
    skip: !blsKey
  })
  const { data: { lsdvalidator } = {} } = useQuery(NodeRunnerByValidatorQuery, {
    variables: { address: blsKey },
    skip: !blsKey
  })

  const [timeLeft, setTimeLeft] = useState<number>(32 * 60)
  const [loading, setLoading] = useState(false)
  const [isBeingTopUp, setBeingTopUp] = useState(false)
  const [reporBalanceStep, setReportBalanceStep] = useState(false)
  const [eligible, setEligible] = useState(true)
  const [error, setError] = useState('')
  const [exitEpochTime, setExitEpochTime] = useState<number>()

  const fetchAuthenticatedReport = useCallback(async () => {
    if (sdk && blsKey) {
      setLoading(true)
      try {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          blsKey
        )
        const authenticatedReport: BalanceReportT = await sdk.balanceReport.authenticateReport(
          BEACON_NODE_URL,
          finalisedEpochReport
        )

        if (authenticatedReport && authenticatedReport.report) {
          const { exitEpoch, currentCheckpointEpoch } = authenticatedReport.report
          if (exitEpoch.length < 13) {
            setTimeLeft((Number(exitEpoch) - currentCheckpointEpoch) * 32 * 12)
            setExitEpochTime(Number(exitEpoch))
          } else {
            setTimeLeft(32 * 60)
          }
        }
      } catch (err) {
        console.log('fetchAuthenticatedReport error: ', err)
      }
      setLoading(false)
    }
  }, [sdk, blsKey])

  useEffect(() => {
    fetchAuthenticatedReport()
  }, [fetchAuthenticatedReport])

  const handleCloseConfirmExitValidatorModal = () => {
    handleReset()
    setEligible(true)
  }

  const handleCheckEligibility = async () => {
    if (sdk && stakehouseAccount && lsdvalidator) {
      const { stakeHouse } = stakehouseAccount
      const { smartWallet } = lsdvalidator
      setBeingTopUp(true)

      try {
        const result = await sdk.utils.lsdRageQuitChecks(
          stakeHouse,
          smartWallet.id,
          smartWallet.liquidStakingNetwork.savETHPool,
          signature
        )
        if (result) {
          navigate(`/ragequit/${blsKey}`)
        } else {
          setEligible(false)
        }
      } catch (err) {
        console.log('err: ', err)
        const msg = handleErr(err, 'others')
        if (msg === true) {
          setEligible(false)
        } else if (msg === 'others') {
          setError('You are not Eligible to Rage Quit.')
        }
      }
      setBeingTopUp(false)
    }
  }

  const handleGoRageQuit = () => {
    navigate(`/ragequit/${blsKey}`)
  }

  if (reporBalanceStep) {
    return (
      <div className="w-full flex-1">
        <div className="max-w-xl w-full mx-auto mt-10 rounded-2xl bg-grey850 p-4 mb-4">
          <Title>
            <img
              src={ArrowLeftSVG}
              className="icon-left-arrow absolute left-0 ml-2"
              onClick={() => navigate('/manage/validators/1')}
            />
            Validator Withdrawal
          </Title>
          <div className="flex flex-col py-7 px-4 border border-border mb-2 rounded-lg bg-grey900">
            <div className="flex gap-3 mb-7">
              <p className="text-white">Report Balance</p>
              <Tooltip message="Sync your dETH token balance with the consensus layer balance." />
            </div>
            <Button size="lg" disabled={isSubmitting} onClick={() => handleSubmit(blsKey || '')}>
              Confirm
            </Button>
          </div>
        </div>
        <LoadingModal open={isSubmitting} onClose={() => {}} title="Confirmation Pending" />
        <ModalConfirmExitValidator
          open={isSubmitted}
          isSubmitting={isBeingTopUp}
          onClose={handleCloseConfirmExitValidatorModal}
          onConfirm={handleCheckEligibility}
        />
        <ModalDialog open={!eligible} onClose={() => {}} controlsClosableOnly>
          <DefaultModalView
            title="Eligibility Status"
            message="You are not eligible to withdraw your validator. Please top up any leakage or slashing you may occurred.">
            <div className="flex items-center w-full justify-center gap-2.5">
              <Button size="lg" onClick={handleGoRageQuit}>
                Rage Quit
              </Button>
              <Button variant="secondary" size="lg">
                <div className="flex items-center gap-2">
                  Learn More <ArrowTopRightIcon />
                </div>
              </Button>
            </div>
          </DefaultModalView>
        </ModalDialog>
        <ErrorModal
          open={!!error}
          onClose={() => setError('')}
          title="Eligibility Status"
          message={error}
          actionButtonContent="Try Again"
          onAction={() => setError('')}
        />
      </div>
    )
  }

  if (timeLeft !== undefined && timeLeft <= 0) {
    return (
      <div className="w-full flex-1">
        <div className="max-w-xl w-full mx-auto mt-10 rounded-2xl bg-grey850 p-4 mb-4">
          <Title>
            <img
              src={ArrowLeftSVG}
              className="icon-left-arrow absolute left-0 ml-2"
              onClick={() => navigate('/manage/validators/1')}
            />
            Validator Withdrawal
          </Title>
          <div className="flex flex-col items-center p-7 border border-border mb-2 rounded-lg bg-grey900">
            <p className="text-primary font-semibold mb-10">Your withdrawal process is over!</p>
            <p className="text-grey700 font-medium mb-2">Time remaining</p>
            <p className="text-white text-2xl font-medium mb-4">00 : 00 : 00</p>
            <Button size="lg" onClick={() => setReportBalanceStep(true)}>
              Withdraw Validator
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1">
      <div className="max-w-xl w-full mx-auto mt-10 rounded-2xl bg-grey850 p-4 mb-4">
        <Title>
          <img
            src={ArrowLeftSVG}
            className="icon-left-arrow absolute left-0 ml-2"
            onClick={() => navigate('/manage/validators/1')}
          />
          Validator Withdrawal
        </Title>
        <div className="flex flex-col items-center p-7 border border-border mb-2 rounded-lg bg-grey900">
          {loading ? (
            <Spinner size={36} />
          ) : (
            <>
              <p className="text-primary font-semibold mb-5">The withdrawal process has started</p>
              <p className="text-grey700 font-medium text-center mb-8">
                {`Please continue running your validator during`}
                <br /> the withdrawal queue to receive the
                <br /> maximum amount of ETH back.
              </p>
              <p className="text-grey700 font-medium mb-2">Estimated time remaining</p>
              <p className="text-white text-2xl font-medium mb-2">
                {timeLeft ? convertDateToString(timeLeft) : '-- : -- : --'}
              </p>
              <p className="text-grey700 mb-4">
                Exit epoch: <b>{exitEpochTime || '--'}</b>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const Title = styled.div`
  ${tw`font-semibold flex gap-5 items-center text-white justify-center relative text-3xl mb-8`}
  .icon-left-arrow {
    ${tw`w-6 h-6 cursor-pointer`}
  }
`
