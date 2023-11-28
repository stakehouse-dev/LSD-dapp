import { FC, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import { ReactComponent as ArrowRightIcon } from '@/assets/images/icon-arrow-right.svg'
import { ReactComponent as ArrowUpIcon } from '@/assets/images/icon-arrow-up.svg'
import { ReactComponent as EmptyCheckBoxIcon } from '@/assets/images/icon-check-empty.svg'
import { ReactComponent as FullCheckBoxIcon } from '@/assets/images/icon-check-full.svg'
import { ReactComponent as ArrowDownIcon } from '@/assets/images/icon-chevron-down.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { ReactComponent as RageQuitIcon } from '@/assets/images/unstaked-withdraw-icon.svg'
import {
  Button,
  ComboMenu,
  CompletedTxView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner,
  Tooltip
} from '@/components/shared'
import { MIN_AMOUNT, WITHDRAW_MODE } from '@/constants'
import {
  useCustomAccount,
  useFetchLsdValidators,
  useLSDNetworkList,
  useLsdValidators,
  useLsdValidatorsByNetwork,
  useMakeRealTxHash,
  useNetworkBasedLinkFactories,
  useWithdrawBalance,
  useWithdrawMethod
} from '@/hooks'
import { TLSDNetwork, TMenu } from '@/types'
import { getMinuteDuration, humanReadableAddress } from '@/utils/global'

import { ModalLSDNetwork, ModalValidators } from '../Modals'

type WithdrawModeProps = {
  mode: WITHDRAW_MODE
  isActive: boolean
  label: string
  handleOpen: (mode: WITHDRAW_MODE) => void
}

export const WithdrawMode: FC<WithdrawModeProps> = ({ label, mode, isActive, handleOpen }) => {
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>('')
  const [txResult, setTxResult] = useState<any>()
  const [txResults, setTxResults] = useState<any[]>()
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string>()
  const [selectedNetwork, setSelectedNetwork] = useState<TMenu>({} as TMenu)
  const [selectedValidator, setSelectedValidator] = useState<TMenu>({} as TMenu)
  const [openNotEligiableModal, setOpenNotEligiableModal] = useState(false)
  const [isLSDModalOpen, setIsLSDModalOpen] = useState<boolean>(false)
  const [isValidatorsModalOpen, setIsValidatorsModalOpen] = useState<boolean>(false)

  const [activeLSD, setActiveLSD] = useState<string>('')

  const navigate = useNavigate()
  const { account } = useCustomAccount()
  const address = account?.address

  const { validators: lsdValidators, isLoading: loadingValidators } = useFetchLsdValidators()
  const {
    balance,
    checkLPTokenIfEligible,
    checkGiantLPTokenIfEligible,
    lastInteractedTimestamp,
    refetch: refetchBalance,
    LSDs,
    loading: isBalanceLoading,
    blsKeys
  } = useWithdrawBalance(lsdValidators.length > 0, mode)

  const [activeBlsKey, setActiveBlsKey] = useState<string>()
  const { handleWithdraw, isLoading, setLoading, handleWithdrawLPToken, handleWithdrawUnstaked } =
    useWithdrawMethod()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { hash } = useMakeRealTxHash(txResult?.hash)
  const { list } = useLSDNetworkList()

  const { lsdNetworkBalance, refetch: refetchNodeOperatorBalance } = useLsdValidators(address ?? '')
  const {
    validators,
    loading,
    refetch: refetchLsdValidatorsByNetwork
  } = useLsdValidatorsByNetwork(address ?? '', selectedNetwork.id as string)

  useEffect(() => {
    if (activeLSD == '' && LSDs && Object.keys(LSDs).length > 0) setActiveLSD(Object.keys(LSDs)[0])
  }, [LSDs])

  useEffect(() => {
    if (blsKeys)
      if (activeLSD in blsKeys) setActiveBlsKey(blsKeys[activeLSD][0].blsKey)
      else setActiveBlsKey(undefined)
  }, [blsKeys, activeLSD, setActiveBlsKey])

  const networkList = useMemo<TMenu[]>(() => {
    if (list && lsdNetworkBalance) {
      return list
        .filter((network) => lsdNetworkBalance[network.liquidStakingManager])
        .map((network: TLSDNetwork) => ({
          id: network.liquidStakingManager,
          label: network.ticker
        })) as TMenu[]
    }

    return []
  }, [list, lsdNetworkBalance])

  const validatorList = useMemo<TMenu[]>(() => {
    if (validators) {
      return validators.map((validator: string) => ({
        id: validator,
        label: `${validator.slice(0, 8)}...${validator.slice(-4)}`
      })) as TMenu[]
    }

    return []
  }, [validators])

  useEffect(() => {
    if (networkList && networkList.length > 0) {
      setSelectedNetwork(networkList[0])
    } else {
      setSelectedNetwork({} as TMenu)
    }
  }, [networkList])

  useEffect(() => {
    if (validatorList && validatorList.length > 0) {
      setSelectedValidator(validatorList[0])
    }
  }, [validatorList])

  const handleCloseSuccessModal = () => {
    setTxResult(undefined)
    setAmount('')
    navigate('/')
  }

  const onOpenClick = () => {
    handleOpen(mode)
    setIsChecked(false)
    setAmount('')
  }

  const handleWithdrawEth = async () => {
    if ([WITHDRAW_MODE.FEES_MEV, WITHDRAW_MODE.STAKING].includes(mode))
      if (activeBlsKey) {
        const lpToken = blsKeys?.[activeLSD].filter((item: any) => item.blsKey == activeBlsKey)[0]
          .lpToken

        const _isEligible = await checkLPTokenIfEligible(lpToken || '')
        if (!_isEligible) return setOpenNotEligiableModal(true)
      } else {
        const _isEligible = await checkGiantLPTokenIfEligible(mode)
        if (!_isEligible) return setOpenNotEligiableModal(true)
      }

    try {
      let txResult: any, txResults: any
      if (mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR) {
        const params = blsKeys?.[activeLSD].filter((item: any) => item.blsKey == activeBlsKey)[0]

        txResults = await handleWithdrawUnstaked(params)
      } else if (mode === WITHDRAW_MODE.NODE_OPERATOR)
        txResult = await handleWithdraw(
          mode,
          Number(amount),
          selectedNetwork.id,
          selectedValidator.id
        )
      else if (activeBlsKey) {
        const lpToken = blsKeys?.[activeLSD].filter((item: any) => item.blsKey == activeBlsKey)[0]
          .lpToken

        txResult = await handleWithdrawLPToken(
          mode,
          Number(amount),
          activeLSD,
          LSDs?.[activeLSD],
          lpToken ?? ''
        )
      } else txResult = await handleWithdraw(mode, Number(amount))
      if (mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR) {
        setTimeout(() => {
          setTxResults(txResults)
        }, 500)
      } else {
        setTimeout(() => {
          setTxResult(txResult)
        }, 500)
      }

      refetchBalance()
      refetchNodeOperatorBalance()
    } catch (err: any) {
      console.log(`withdraw ${label} error-----------------`)
      console.log(err, err.message)
      setLoading(false)
      setTimeout(() => {
        setError(err.reason[0].toUpperCase() + err.reason.substr(1))
        setFailed(true)
      }, 500)
    }
  }

  const withdrawalBalance = useMemo(() => {
    if (activeLSD == 'giant_pool' && LSDs) return LSDs[activeLSD].balance

    if (activeBlsKey)
      if (blsKeys?.[activeLSD].filter((item: any) => item.blsKey == activeBlsKey).length)
        return Number(
          blsKeys?.[activeLSD].filter((item: any) => item.blsKey == activeBlsKey)[0].balance
        )

    return 0
  }, [activeLSD, LSDs, activeBlsKey, blsKeys])

  const onMaxClick = async () => {
    if (mode === WITHDRAW_MODE.NODE_OPERATOR) {
      setAmount(lsdNetworkBalance[selectedNetwork.id])
    } else {
      setAmount(Number(withdrawalBalance).toString())
    }
  }

  useEffect(() => {
    if (mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR) {
      setAmount(withdrawalBalance ? Number(withdrawalBalance).toString() : '0')
    }
  }, [mode, withdrawalBalance, isChecked])

  const errMessage = useMemo(() => {
    const _balance =
      mode === WITHDRAW_MODE.NODE_OPERATOR
        ? lsdNetworkBalance[selectedNetwork.id]
        : withdrawalBalance

    if (!_balance || amount === '') return ''

    if (Number(_balance) < MIN_AMOUNT || Number(amount) > Number(_balance)) {
      return 'Insufficient Balance'
    }

    if (Number(amount) < Number(MIN_AMOUNT)) {
      return 'Amount should be greater than 0.001'
    }

    return ''
  }, [withdrawalBalance, amount])

  return (
    <Mode isActive={isActive}>
      <div
        onClick={onOpenClick}
        className="flex items-center justify-between cursor-pointer px-4 py-3">
        <Label>
          {mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR ? <RageQuitIcon /> : <EthIcon />}
          {label}
        </Label>
        <div className="text-sm font-medium text-grey700 flex items-center gap-2">
          {isBalanceLoading || loadingValidators ? (
            <>
              <Spinner size={16} />
            </>
          ) : (
            <>
              Available <Balance isActive={Number(balance) > 0}>{balance} ETH</Balance>
              {isActive ? <ArrowUpIcon /> : <ArrowRightIcon />}
            </>
          )}
        </div>
      </div>
      {isActive && (
        <>
          {isChecked && (
            <div className="flex flex-col px-3 py-2 gap-2">
              {activeLSD && mode !== WITHDRAW_MODE.NODE_OPERATOR && (
                <>
                  <div className="w-full flex justify-between px-2 items-center mb-2 text-xs">
                    <div className="flex gap-2 items-center">
                      <span className="">Withdraw From:</span>
                      <button
                        onClick={() => setIsLSDModalOpen(true)}
                        className="bg-black rounded-lg flex font-medium items-center gap-2 py-2 px-4 border border-solid border-grey500">
                        {LSDs?.[activeLSD].ticker} <ArrowDownIcon />
                      </button>
                    </div>
                    {activeBlsKey && (
                      <div className="flex gap-2 items-center">
                        <span>Validator:</span>
                        <button
                          onClick={() => setIsValidatorsModalOpen(true)}
                          className="bg-black rounded-lg flex font-medium items-center gap-2 py-2 px-4 border border-solid border-grey500">
                          {humanReadableAddress(activeBlsKey, 4)} <ArrowDownIcon />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="withdraw__input">
                    <input
                      value={amount}
                      placeholder="Amount"
                      disabled={mode === WITHDRAW_MODE.UNSTAKED_VALIDATOR}
                      onChange={(e) => {
                        const val = '0' + e.target.value
                        if (!isNaN(Number(val))) {
                          setAmount(e.target.value)
                        }
                      }}
                    />
                    {mode !== WITHDRAW_MODE.UNSTAKED_VALIDATOR && (
                      <div className="withdraw__input__max">
                        <span>ETH</span>
                        <button onClick={onMaxClick}>
                          <p className="text-xs font-medium text-primary700">MAX</p>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              {mode === WITHDRAW_MODE.NODE_OPERATOR ? (
                <div className="flex justify-between">
                  <span className="ml-2 text-xs text-error">{errMessage}</span>
                  <div className="text-sm font-medium text-grey700 text-right">
                    LSD Network Balance:{' '}
                    <Balance isActive={Number(lsdNetworkBalance[selectedNetwork.id]) > 0}>
                      {(isNaN(lsdNetworkBalance[selectedNetwork.id])
                        ? 0
                        : Number(lsdNetworkBalance[selectedNetwork.id])
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 4
                      })}{' '}
                      ETH
                    </Balance>
                  </div>
                </div>
              ) : (
                <span className="ml-2 text-xs text-error">{errMessage}</span>
              )}
              {mode === WITHDRAW_MODE.NODE_OPERATOR && (
                <div className="border border-innerBorder rounded-lg w-full p-3 flex flex-col gap-2">
                  <div className="flex w-full items-center justify-between">
                    <p className="text-sm text-white font-medium flex items-center gap-1">
                      Select LSD Network
                      <Tooltip message="Select an LSD Network for your validator." />
                    </p>
                    <ComboMenu
                      onSelect={setSelectedNetwork}
                      selected={selectedNetwork}
                      options={networkList}
                      className="w-40 h-10"
                    />
                  </div>
                  {loading && (
                    <div className="flex mt-2 items-center justify-center">
                      <Spinner size={24} />
                    </div>
                  )}
                  {!loading && (
                    <>
                      {validatorList.length > 0 ? (
                        <div className="flex w-full items-center justify-between">
                          <p className="text-sm text-white font-medium">Select Validator</p>
                          <ComboMenu
                            onSelect={setSelectedValidator}
                            selected={selectedValidator}
                            options={validatorList}
                            className="w-40 h-10"
                          />
                        </div>
                      ) : (
                        <div className="text-grey700 text-center mt-2 text-sm">
                          No validator available in this network
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <Button
                size="lg"
                disabled={
                  mode === WITHDRAW_MODE.NODE_OPERATOR
                    ? !selectedValidator || !validatorList.length
                    : !Number(amount) || errMessage.length > 0
                }
                onClick={handleWithdrawEth}>
                Withdraw
              </Button>
            </div>
          )}
          <div
            className={`flex gap-1 px-4 cursor-pointer text-sm ${
              isChecked ? 'text-white' : 'text-grey600'
            }`}
            onClick={() => setIsChecked(true)}>
            {isChecked ? <FullCheckBoxIcon /> : <EmptyCheckBoxIcon />}I understand that withdrawing
            ETH will result in losing future rewards for staked ETH.
          </div>
        </>
      )}

      <LoadingModal open={isLoading} title="Confirmation Pending" onClose={() => {}} />
      <ErrorModal
        open={failed}
        onClose={() => setFailed(false)}
        title="Withdraw Failed"
        message={error}
        actionButtonContent="Try Again"
        onAction={() => setFailed(false)}
      />
      <ErrorModal
        open={openNotEligiableModal}
        onClose={() => setOpenNotEligiableModal(false)}
        title="Not Withdrawable"
        message={`You can withdraw after ${getMinuteDuration(lastInteractedTimestamp)} minutes`}
        actionButtonContent="Try Again"
        onAction={() => setOpenNotEligiableModal(false)}
      />
      <ModalDialog
        open={!!txResult}
        onClose={() => {
          setTxResult(undefined)
          refetchNodeOperatorBalance()
          refetchLsdValidatorsByNetwork()
        }}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLink={makeEtherscanLink(hash)}
          onGoToClick={handleCloseSuccessModal}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300">{`Your transaction has processed.`}</span>
            </div>
          }
        />
      </ModalDialog>
      <ModalDialog
        open={txResults && txResults.length > 0 ? true : false}
        onClose={() => setTxResults(undefined)}
        hideCloseButton={true}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLinks={
            txResults &&
            txResults?.map((item: any) => {
              return {
                name: item.txName,
                href: makeEtherscanLink(item.transaction.hash)
              }
            })
          }
          onGoToClick={handleCloseSuccessModal}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300">{`Your transactions has been processed.`}</span>
            </div>
          }
        />
      </ModalDialog>
      <ModalLSDNetwork
        open={isLSDModalOpen}
        networks={LSDs ?? {}}
        setActiveNetwork={setActiveLSD}
        onClose={() => setIsLSDModalOpen(false)}
      />
      {activeBlsKey && (
        <ModalValidators
          setActiveKey={setActiveBlsKey}
          validators={blsKeys?.[activeLSD] ?? []}
          open={isValidatorsModalOpen}
          onClose={() => setIsValidatorsModalOpen(false)}
        />
      )}
    </Mode>
  )
}

const Label = tw.span`flex items-center gap-1 text-base font-semibold`

const Mode = styled.div<{ isActive: boolean }>`
  ${tw`border rounded-lg border-innerBorder flex flex-col`}
  ${(props) => props.isActive && tw`bg-[#202024] pb-3`}
`
const Balance = styled.span<{ isActive: boolean }>`
  ${(props) => props.isActive && tw`text-white`}
`
