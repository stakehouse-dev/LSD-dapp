import './NodeOperator.scss'

import { useQuery } from '@apollo/client'
import { FC, useEffect, useMemo, useState } from 'react'
import { useBalance } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import {
  Button,
  ComboMenu,
  CompletedTxView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Tooltip,
  UploadDepositFile,
  ValidatorRegisterCard
} from '@/components/shared'
import { MAX_GAS_FEE } from '@/constants'
import { config } from '@/constants/environment'
import { AllLSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import {
  useCustomAccount,
  useDepositNodeRunner,
  useMakeRealTxHash,
  useNetworkBasedLinkFactories
} from '@/hooks'
import { DepositObjectT, TLSDNetwork, TMenu } from '@/types'
import { handleErr } from '@/utils/global'

import { DepositFooter } from './Footer'

type NodeOperatorProps = {
  onBack: () => void
}
export const NodeOperator: FC<NodeOperatorProps> = ({ onBack }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<TMenu>()
  const [step, setStep] = useState(1)
  const [failed, setFailed] = useState('')
  const [depositObject, setDepositObject] = useState<DepositObjectT | undefined>()
  const [txResult, setTxResult] = useState<any>()

  const { account } = useCustomAccount()
  const address = account?.address
  const { data: { formatted: balance } = {} } = useBalance({
    address: address,
    formatUnits: 'ether',
    chainId: config.networkId
  })

  const { data: { liquidStakingNetworks: list } = {} } = useQuery(AllLSDNetworksQuery)
  const { handleDeposit, isLoading, setLoading } = useDepositNodeRunner()
  const { hash } = useMakeRealTxHash(txResult?.hash)
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  const networkList = useMemo<TMenu[]>(() => {
    if (list) {
      return list.map((network: TLSDNetwork) => ({
        id: network.id,
        label: network.ticker
      })) as TMenu[]
    }

    return []
  }, [list])

  useEffect(() => {
    if (networkList && networkList.length > 0) {
      setSelectedNetwork(networkList[0])
    }
  }, [networkList])

  const handleGoNextStep = (_depositObject: DepositObjectT) => {
    setDepositObject(_depositObject)
    setStep(2)
  }

  const handleDepositEth = async () => {
    if (
      !selectedNetwork ||
      !depositObject ||
      !address ||
      Number(balance) < 4 * depositObject.length + MAX_GAS_FEE
    ) {
      setFailed(
        'Please ensure your deposit_data.json file is correct, and that you have enough ETH in your wallet.'
      )
      setStep(1)
      setDepositObject(undefined)
      return
    }

    let depositValidation = true
    let withdrawalCredentialValidation = true
    depositObject.forEach((deposit) => {
      if (!deposit) {
        depositValidation = false
      }

      if (deposit.withdrawal_credentials !== config.WITHDRAWAL_CREDENTIALS) {
        withdrawalCredentialValidation = false
      }
    })

    if (!depositValidation) {
      setFailed('Please upload correct Deposit file')
      setStep(1)
      setDepositObject(undefined)
      return
    }

    if (!withdrawalCredentialValidation) {
      setFailed('Incorrect withdrawal credentials')
      setStep(1)
      setDepositObject(undefined)
      return
    }

    try {
      const txResult = await handleDeposit(`${selectedNetwork.id}`, depositObject, address)
      setTimeout(() => {
        setTxResult(txResult)
      }, 500)
    } catch (err: any) {
      console.log('deposit by node runner error-----------------')
      console.log(err, err.message)
      setLoading(false)
      setTimeout(() => {
        setFailed(handleErr(err, 'Something went wrong.'))
      }, 500)
    }
  }

  const handleCloseSuccessModal = () => {
    setTxResult(undefined)
    setStep(1)
    setDepositObject(undefined)
    onBack()
  }

  const commission = useMemo(() => {
    if (list && selectedNetwork) {
      const network = list.find((n: TLSDNetwork) => n.id === selectedNetwork.id)

      if (network) {
        return Number(network.commission) / 100000
      }
    }

    return '0'
  }, [list, selectedNetwork])

  return (
    <div className="content node-operator">
      <div className="content__box">
        <div className="content__box__title">
          <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={onBack} />
          Node Operator
        </div>
        <ValidatorRegisterCard
          active={step === 1}
          done={step === 2}
          stepNum={1}
          showGuide
          title="Register your validator"
          tooltip={
            <span>
              This will register your validator BLS key with an LSD Network to receive 28 ETH
              funding. Please follow our{' '}
              <a
                className="text-primary"
                target="_blank"
                rel="noreferrer"
                href="https://help.joinstakehouse.com/en/articles/6597493-how-do-i-generate-my-validator-keys-using-wagyu-keygen-mainnet-testnet">
                Key Generation
              </a>{' '}
              guide or your deposit may fail.
            </span>
          }>
          <UploadDepositFile
            onUploaded={handleGoNextStep}
            onClear={() => setDepositObject(undefined)}
          />
        </ValidatorRegisterCard>
        <ValidatorRegisterCard
          active={step === 2}
          done={step === 3}
          stepNum={2}
          title={`Deposit ${4 * (depositObject ? depositObject.length : 0)} ETH (${
            depositObject ? depositObject.length : 0
          })`}
          tooltip="This will prepare your validator keys to to have 28 ETH matched from the community.">
          <div className="border border-innerBorder rounded-lg w-full p-4 flex flex-col gap-4">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-white font-medium flex items-center gap-1">
                Select LSD Network
                <Tooltip message="Select an LSD Network for your validator." />
              </p>
              <div>
                <ComboMenu
                  onSelect={setSelectedNetwork}
                  selected={selectedNetwork}
                  options={networkList}
                  className="w-40 h-10"
                />
                <div className="text-xxs text-grey300 w-full text-right">
                  Current Commission: {commission}%
                </div>
              </div>
            </div>
            <Button disabled={isLoading} onClick={handleDepositEth}>
              Deposit
            </Button>
          </div>
        </ValidatorRegisterCard>
      </div>
      <DepositFooter from="Node Runner" />
      <ErrorModal
        open={!!failed}
        onClose={() => setFailed('')}
        title="Deposit Failed"
        message={
          failed === 'Incorrect withdrawal credentials' ? (
            <>
              Incorrect withdrawal credentials.
              <br />
              Make sure to use {process.env.REACT_APP_NETWORK_ID === '1'
                ? 'Mainnet'
                : 'Goerli'}{' '}
              Stakehouse Account Manager as the withdrawal credential.{' '}
              <a
                target={'_blank'}
                className="text-primary300"
                href="https://help.joinstakehouse.com/en/articles/6597493-how-do-i-generate-my-validator-keys-using-wagyu-keygen-mainnet-testnet"
                rel="noreferrer">
                Learn More.
              </a>
            </>
          ) : (
            failed
          )
        }
        actionButtonContent="Try Again"
        onAction={() => setFailed('')}
      />
      <LoadingModal open={isLoading} onClose={() => {}} title="Confirmation Pending" />
      <ModalDialog open={!!txResult} onClose={handleCloseSuccessModal}>
        <CompletedTxView
          goToContent="Home"
          title="Success"
          txLink={makeEtherscanLink(hash)}
          onGoToClick={handleCloseSuccessModal}
          message={
            <div className="flex flex-col items-center">
              <span className="text-sm text-grey300 mb-2">
                You have registered your validator and deposited a{' '}
                {4 * (depositObject ? depositObject.length : 0)} ETH bond.
              </span>
              <span className="text-sm text-grey300">
                It may take up to 30 minutes for your validator to show up.
              </span>
              <span className="text-sm text-grey300">
                {'After you will need to click the "Ready to Stake" button.'}
              </span>
            </div>
          }
        />
      </ModalDialog>
    </div>
  )
}
