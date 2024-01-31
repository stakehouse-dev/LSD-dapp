import { useQuery } from '@apollo/client'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import { ReactComponent as ArrowRightIcon } from '@/assets/images/icon-arrow-right.svg'
import { ReactComponent as ArrowUpIcon } from '@/assets/images/icon-arrow-up.svg'
import ArrowChevronDownIcon from '@/assets/images/icon-chevron-down.svg'
import { ReactComponent as ArrowDownIcon } from '@/assets/images/icon-chevron-down.svg'
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
import { WITHDRAW_MODE } from '@/constants'
import { DETH_WITHDRAW_TOKENS, TokenT } from '@/constants/tokens'
import { RewardsContext } from '@/context/RewardsContext'
import { MintedValidators } from '@/graphql/queries/NodeRunners'
import {
  useClaimMethod,
  useCustomAccount,
  useFetchETHAvailableValidator,
  useGiantPoolClaim,
  useLSDNetworkList,
  useMakeRealTxHash,
  useNetworkBasedLinkFactories,
  useRewardBalance,
  useTotalRewardBalance
} from '@/hooks'
import { TLSDNetwork, TMenu } from '@/types'
import { humanReadableAddress, roundNumber } from '@/utils/global'

import {
  ModalLSDNetwork,
  ModalReportBalance,
  ModalReportBalanceForRedeem,
  ModalTokens,
  ModalValidators
} from '../Modals'

type RewardModeProps = {
  mode: WITHDRAW_MODE
  isActive: boolean
  label: string
  handleOpen: (mode: WITHDRAW_MODE) => void
  src: string
}

const RewardMode: FC<RewardModeProps> = ({ label, mode, isActive, handleOpen, src }) => {
  const [amount, setAmount] = useState<string>('0')
  const [txResult, setTxResult] = useState<any>()
  const [txResults, setTxResults] = useState<any[]>()
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState<string>()
  const [selectedNetwork, setSelectedNetwork] = useState<TMenu>({} as TMenu)
  const [isLSDModalOpen, setIsLSDModalOpen] = useState<boolean>(false)
  const [isValidatorsModalOpen, setIsValidatorsModalOpen] = useState<boolean>(false)
  const [activeBlsKey, setActiveBlsKey] = useState<string>()
  const [openTokenModal, setOpenTokenModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenT>(DETH_WITHDRAW_TOKENS[0])
  const [openReportBalance, setOpenReportBalance] = useState(false)
  const [openReportBalanceModal, setOpenReportBalanceModal] = useState(false)

  const [activeLSD, setActiveLSD] = useState<string>('giant_pool')

  const navigate = useNavigate()
  const { account } = useCustomAccount()
  const address = account?.address

  const { list } = useLSDNetworkList()
  const { batchPartialWithdrawal } = useFetchETHAvailableValidator(activeBlsKey, mode)
  const { batchPartialWithdrawalFromGiantSavETHPool, batchClaimETHFromPartialWithdrawal } =
    useGiantPoolClaim()
  const { handleClaim, isLoading, setLoading } = useClaimMethod()
  const { hash } = useMakeRealTxHash(txResult?.hash)
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()
  const { rewards, balance: TotalBalance, refetch: refetchBalance } = useContext(RewardsContext)

  const {
    LSDs,
    validators: blsKeys,
    loading,
    balance: totalBalance,
    protectedBatches,
    refetch
  } = useRewardBalance(mode, selectedToken)

  const { refetch: refetchTotalRewards } = useTotalRewardBalance()

  const { data: validatorsData, loading: validatorsLoading } = useQuery(MintedValidators, {
    variables: {
      account: address?.toLowerCase(),
      network: selectedNetwork.id
    },
    skip: mode !== WITHDRAW_MODE.NODE_OPERATOR
  })

  useEffect(() => {
    if (blsKeys)
      if (activeLSD in blsKeys) setActiveBlsKey(blsKeys[activeLSD][0].blsKey)
      else setActiveBlsKey(undefined)
  }, [blsKeys, activeLSD, setActiveBlsKey])

  const balance = useMemo(() => {
    if (selectedNetwork.id && mode === WITHDRAW_MODE.NODE_OPERATOR) {
      return rewards.nodeOperator[selectedNetwork.id] ?? 0
    }

    if (LSDs && mode === WITHDRAW_MODE.FEES_MEV) {
      return LSDs[activeLSD]?.rawBalance ?? 0
    }

    if (activeLSD == 'giant_pool' && LSDs) {
      if (selectedToken === DETH_WITHDRAW_TOKENS[0]) return LSDs[activeLSD]?.dethBalance ?? 0
      else return LSDs[activeLSD]?.balance ?? 0
    }

    if (activeBlsKey)
      if (blsKeys?.[activeLSD].filter((item) => item.blsKey == activeBlsKey).length) {
        if (selectedToken === DETH_WITHDRAW_TOKENS[0])
          return blsKeys?.[activeLSD].filter((item) => item.blsKey == activeBlsKey)[0].dethBalance
        return blsKeys?.[activeLSD].filter((item) => item.blsKey == activeBlsKey)[0].rawBalance
      }

    return 0
  }, [activeLSD, LSDs, activeBlsKey, blsKeys, selectedNetwork.id, mode])

  const activeValidator = useMemo(() => {
    if (mode === WITHDRAW_MODE.STAKING && LSDs) {
      if (activeLSD === 'giant_pool') {
        return LSDs[activeLSD]
      }

      if (activeBlsKey) {
        return blsKeys?.[activeLSD].filter((item) => item.blsKey == activeBlsKey)[0]
      }
    }

    return undefined
  }, [activeLSD, mode, LSDs, activeBlsKey, blsKeys])

  const totalNodeOperatorAmount = useMemo(() => {
    if (rewards) {
      return rewards.totalNodeOperatorBalance
    }

    return 0
  }, [rewards, TotalBalance])

  const networkList = useMemo<TMenu[]>(() => {
    if (list && rewards) {
      return list
        .filter((network) => !!rewards.nodeOperator[network.liquidStakingManager])
        .map((network: TLSDNetwork) => ({
          id: network.liquidStakingManager,
          label: network.ticker
        })) as TMenu[]
    }

    return []
  }, [list, rewards])

  useEffect(() => {
    if (selectedToken === DETH_WITHDRAW_TOKENS[1] && mode === WITHDRAW_MODE.STAKING) {
      if (activeLSD === 'giant_pool' && protectedBatches) {
        handleOpenReportBalanceModal()
      } else {
        handleOpenReportBalance()
      }
    }
  }, [selectedToken, mode, activeLSD, protectedBatches, activeBlsKey])

  useEffect(() => {
    if (networkList && networkList.length > 0) {
      setSelectedNetwork(networkList[0])
    }
  }, [networkList])

  useEffect(() => {
    if (mode === WITHDRAW_MODE.STAKING) {
      setAmount('0')
    }
  }, [activeLSD])

  useEffect(() => {
    if (!isNaN(balance) && mode === WITHDRAW_MODE.STAKING) {
      setAmount(balance)
    }
  }, [balance, mode, activeLSD, selectedToken])

  const onOpenClick = () => {
    handleOpen(mode)
    setAmount('')
  }

  const handleCloseSuccessModal = () => {
    setTxResult(undefined)
    setTxResults(undefined)
    setAmount('')
    navigate('/')
  }

  const onMaxClick = () => {
    setAmount(balance)
  }

  const handleOpenTokenModal = () => {
    setOpenTokenModal(true)
  }
  const handleCloseTokenModal = () => setOpenTokenModal(false)
  const handleSelectToken = (token: TokenT) => {
    setSelectedToken(token)
    handleCloseTokenModal()
  }

  const handleOpenReportBalance = () => setOpenReportBalance(true)
  const handleCloseReportBalance = async (submitted?: boolean) => {
    setOpenReportBalance(false)
    if (submitted) {
      // refetch()
      refetchTotalRewards()
    }
  }

  const handleOpenReportBalanceModal = () => {
    setOpenReportBalanceModal(true)
  }
  const handleCloseReportBalanceModal = async (submitted?: boolean) => {
    setOpenReportBalanceModal(false)
    if (submitted) {
      refetch()
      refetchTotalRewards()
    }
  }
  const handleSubmittedReportBalance = async () => {
    setOpenReportBalanceModal(false)
    // refetch()
  }

  const errMessage = useMemo(() => {
    if (amount === '') return ''

    if (Number(amount) > Number(balance)) {
      if (selectedToken === DETH_WITHDRAW_TOKENS[0])
        return 'Burn amount cannot exceed LP balance. (Available LP Balance: ' + balance + ')'
      return 'Insufficient Balance'
    }

    return ''
  }, [balance, amount])

  const handleClaimEth = async () => {
    try {
      let txResult: any
      let txResults: any[] = []
      if (mode === WITHDRAW_MODE.STAKING) {
        if (selectedToken === DETH_WITHDRAW_TOKENS[1] && activeBlsKey) {
          setLoading(true)
          const result = await batchPartialWithdrawal()
          setLoading(false)

          txResult = result
        } else if (selectedToken === DETH_WITHDRAW_TOKENS[1] && !activeBlsKey) {
          setLoading(true)
          const result = await batchPartialWithdrawalFromGiantSavETHPool()
          const result1 = await batchClaimETHFromPartialWithdrawal()
          setLoading(false)

          if (result) txResults.push({ txName: 'Giant Pool', txHash: result.hash })
          if (result1) txResults.push({ txName: 'Fren-delegation', txHash: result1.hash })
        } else if (activeBlsKey) {
          const lpToken = blsKeys?.[activeLSD].filter((item) => item.blsKey == activeBlsKey)[0]
            .lpToken
          txResult = await handleClaim(mode, Number(amount), lpToken)
        } else txResult = await handleClaim(mode, Number(amount))
      } else if (mode === WITHDRAW_MODE.FEES_MEV) {
        if (activeLSD !== 'giant_pool')
          txResult = await handleClaim(
            mode,
            Number(balance),
            LSDs?.[activeLSD].feesAndMevPool,
            undefined,
            LSDs?.[activeLSD].blsKeys
          )
        else txResult = await handleClaim(mode, Number(amount))
      } else {
        const blsPublicKeys = validatorsData.nodeRunners[0].validators.map((item: any) => item.id)
        txResult = await handleClaim(mode, Number(amount), '', selectedNetwork.id, blsPublicKeys)
      }

      setTimeout(() => {
        if (txResults && txResults.length > 0) {
          setTxResults(txResults)
        } else {
          setTxResult(txResult)
        }
      }, 500)

      refetchBalance()
      refetch()
    } catch (err: any) {
      console.log(`withdraw ${label} error-----------------`)
      console.log(err, err.message)
      setLoading(false)
      setTimeout(() => {
        setFailed(true)
        setError(err.reason[0].toUpperCase() + err.reason.substr(1))
      }, 500)
    }
  }

  return (
    <Mode isActive={isActive}>
      <div
        onClick={() => onOpenClick()}
        className="flex items-center justify-between cursor-pointer px-4 py-3">
        <Label>
          <img src={src} className="w-6 h-6" />
          {label}
        </Label>
        <Balance isActive={Number(balance) > 0}>
          <span>
            Available{' '}
            {mode === WITHDRAW_MODE.NODE_OPERATOR
              ? roundNumber(totalNodeOperatorAmount, 3)
              : roundNumber(Number(totalBalance), 3)}{' '}
            {mode !== WITHDRAW_MODE.STAKING
              ? 'ETH'
              : selectedToken === DETH_WITHDRAW_TOKENS[0]
              ? 'dETH'
              : 'ETH'}
          </span>
          {isActive ? <ArrowUpIcon /> : <ArrowRightIcon />}
        </Balance>
      </div>
      {isActive && (
        <div className="flex flex-col px-11 py-2 gap-2">
          {mode !== WITHDRAW_MODE.NODE_OPERATOR && (
            <>
              <div className="w-full flex justify-between px-2 items-center mb-2 text-xs">
                <div className="flex gap-2 items-center">
                  <span className="">Withdraw From:</span>
                  {loading ? (
                    <Spinner size={24} />
                  ) : (
                    <button
                      onClick={() => setIsLSDModalOpen(true)}
                      className="bg-black rounded-lg flex font-medium items-center gap-2 py-2 px-4 border border-solid border-grey500">
                      {LSDs?.[activeLSD].ticker} <ArrowDownIcon />
                    </button>
                  )}
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
            </>
          )}
          <div className="withdraw__input">
            <input
              value={mode !== WITHDRAW_MODE.STAKING ? balance : amount}
              disabled={
                mode !== WITHDRAW_MODE.STAKING ||
                (mode === WITHDRAW_MODE.STAKING && selectedToken === DETH_WITHDRAW_TOKENS[1])
              }
              placeholder="Amount"
              onChange={(e) => {
                const val = '0' + e.target.value
                if (!isNaN(Number(val))) {
                  setAmount(e.target.value)
                }
              }}
            />
            <div className="withdraw__input__max">
              {mode !== WITHDRAW_MODE.STAKING ? (
                <span>ETH</span>
              ) : (
                <div
                  className="rounded-full p-1 pr-2 bg-grey800 flex items-center gap-2 cursor-pointer"
                  onClick={handleOpenTokenModal}>
                  <img src={selectedToken.icon} alt="token_icon" className="w-6" />
                  <p className="text-textBase text-xl font-medium leading-5">
                    {selectedToken.symbol}
                  </p>
                  <img src={ArrowChevronDownIcon} alt="down_icon" className="w-3 mr-1" />
                  <ModalTokens
                    onSelect={handleSelectToken}
                    onClose={handleCloseTokenModal}
                    activeValidator={activeValidator}
                    open={openTokenModal}
                  />
                </div>
              )}
            </div>
          </div>
          <span className="ml-2 text-xs text-error">{errMessage}</span>
          {mode === WITHDRAW_MODE.NODE_OPERATOR ? (
            <div className="border border-innerBorder rounded-lg w-full p-4 flex flex-col gap-4">
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
              <Button
                size="lg"
                disabled={
                  !Number(balance) || validatorsLoading || !validatorsData.nodeRunners.length
                }
                onClick={handleClaimEth}>
                Claim
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              disabled={
                (mode === WITHDRAW_MODE.STAKING ? !Number(amount) : !Number(balance)) ||
                errMessage.length > 0 ||
                loading
              }
              onClick={handleClaimEth}>
              Claim
            </Button>
          )}
        </div>
      )}
      <LoadingModal open={isLoading} title="Confirmation Pending" onClose={() => {}} />
      <ErrorModal
        open={failed}
        onClose={() => setFailed(false)}
        title="Claim Failed"
        message={error}
        actionButtonContent="Try Again"
        onAction={() => setFailed(false)}
      />
      <ModalDialog open={!!txResult} onClose={() => setTxResult(undefined)}>
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
                href: makeEtherscanLink(item.txHash || '')
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
      <ModalReportBalance
        open={openReportBalance}
        blsKey={activeBlsKey}
        onClose={handleCloseReportBalance}
        onSubmitted={() => handleCloseReportBalance(true)}
      />
      <ModalReportBalanceForRedeem
        open={openReportBalanceModal}
        protectedBatches={protectedBatches}
        dETHAmount={amount}
        onClose={handleCloseReportBalanceModal}
        onSubmitted={handleSubmittedReportBalance}
      />
    </Mode>
  )
}

export default RewardMode

const Label = tw.span`flex items-center gap-2 text-base font-semibold`
const Mode = styled.div<{ isActive: boolean }>`
  ${tw`border rounded-lg border-innerBorder flex flex-col`}

  ${(props) => props.isActive && tw`bg-[#202024] pb-3`}
`
const Balance = styled.span<{ isActive: boolean }>`
  ${tw`text-sm font-medium text-grey700 flex gap-2 items-center`}
  ${(props) => props.isActive && tw`text-primary`}
`
