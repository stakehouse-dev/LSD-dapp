import { ethers } from 'ethers'
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'

import AsssetDetailsSVG from '@/assets/images/asset-details.svg'
import { ReactComponent as SearchIcon } from '@/assets/images/search.svg'
import {
  ModalApproveMint,
  ModalConfirmStake,
  ModalValidatorMint,
  ModalValidatorStake
} from '@/components/app/Modals'
import { Button, TextInput, Tooltip } from '@/components/shared'
import { LSD_STATUS } from '@/constants/lsdStatus'
import { useAvailableToStake, useFetchLsdValidators, useInProgress, useSDK } from '@/hooks'
import { TLSDNetwork, TLSDValidator } from '@/types'

import { ValidatorTableRow } from './ValidatorTabeRow'

const VALIDATOR_FILTER = [
  { id: 0, label: 'All' },
  { id: 1, label: 'Stake', tooltip: 'Shows only stakeable validators' },
  { id: 2, label: 'Mint', tooltip: 'Shows only mintable validators' }
]
export enum BATCH_FLOW {
  NONE,
  STAKING,
  MINTING
}

export const Validators: FC = () => {
  const navigate = useNavigate()
  const { validators, networks, handleRefresh } = useFetchLsdValidators()
  const { amount: availableToStake } = useAvailableToStake('Main')
  const { amount: inProgress } = useInProgress('Main')
  const { amount: stakingOpenPoolETH } = useAvailableToStake('Staking')
  const { amount: stakingInProgress } = useInProgress('Staking')
  const { amount: feesMevOpenPoolETH } = useAvailableToStake('FeesMev')
  const { amount: feesMevInProgress } = useInProgress('FeesMev')

  const { sdk } = useSDK()

  const [selectedValidators, setSelectedValidators] = useState<TLSDValidator[]>([])
  const [selectedValidatorsForStake, setSelectedValidatorsForStake] = useState<TLSDValidator[]>([])
  const [selectedValidatorsForMint, setSelectedValidatorsForMint] = useState<string[]>([])
  const [networkSearchIds, setNetworkSearchIds] = useState<string[]>([])
  const [networkSearchKey, setNetworkSearchKey] = useState('')
  const [approving, setApproving] = useState(false)
  const [failedApprove, setFailedApprove] = useState(false)
  const [validatorFilter, setValidatorFilter] = useState(0)
  const [selectedNetwork, setSelectedNetwork] = useState<TLSDNetwork>()
  const [openConfirmStakeDlg, setOpenConfirmStakeDlg] = useState(false)
  const [hasMintableValidator, setHasMintableValidator] = useState<any>({})
  const [stakableValidators, setStakableValidators] = useState<TLSDValidator[]>([])
  const [requiredFunds, setRequiredFunds] = useState<any[]>([])
  const [hasMatchingValidators, setHasMatchingValidators] = useState(false)

  useEffect(() => {
    setHasMatchingValidators(false)
  }, [validatorFilter])

  useEffect(() => {
    if (networks.length > 0) {
      setNetworkSearchIds(networks.map((network) => network.id))
    }
  }, [networks])

  useEffect(() => {
    const fetchFundsEligibility = async () => {
      if (sdk && validators.length > 0) {
        try {
          let readyStakeValidators = validators.filter(
            (validator) => validator.status === LSD_STATUS.READY_TO_STAKE
          )

          const waitStakeValidators = validators.filter(
            (validator) => validator.status === LSD_STATUS.WAITING_FOR_ETH
          )
          readyStakeValidators = [...readyStakeValidators, ...waitStakeValidators]

          if (readyStakeValidators.length > 0) {
            const blsKeys = readyStakeValidators.map((v) => v.id)
            try {
              const funds = await sdk.wizard.batchCalculateFundsRequiredForStaking(blsKeys)
              const convertedFunds = funds.map((fund: any) => ({
                savETH: Number(ethers.utils.formatEther(ethers.BigNumber.from(fund.savETH))),
                feesAndMEV: Number(
                  ethers.utils.formatEther(ethers.BigNumber.from(fund.feesAndMEV))
                ),
                directDeposit: fund.directDeposit
              }))
              const requiredFunds: any[] = []
              for (let i = 0; i < blsKeys.length; i++) {
                requiredFunds.push({ blsKey: blsKeys[i], funds: convertedFunds[i] })
              }
              setRequiredFunds(requiredFunds)
              const stakableValidators = readyStakeValidators.filter((validator) => {
                if (validator.status === LSD_STATUS.READY_TO_STAKE) return true
                if (validator.status === LSD_STATUS.WAITING_FOR_ETH) {
                  const fund = requiredFunds.find((f) => f.blsKey === validator.id)
                  if (
                    fund.funds.savETH <= stakingOpenPoolETH + stakingInProgress &&
                    fund.funds.feesAndMEV <= feesMevOpenPoolETH + feesMevInProgress
                  )
                    return true
                }
                return false
              })
              setStakableValidators(stakableValidators)
            } catch (err) {
              console.log('batchCalculateFundsRequiredForStaking error: ', err)
            }
          }
        } catch (err) {
          console.log('error: ', err)
        }
      }
    }

    fetchFundsEligibility()
  }, [
    validators,
    sdk,
    availableToStake,
    inProgress,
    stakingOpenPoolETH,
    stakingInProgress,
    feesMevOpenPoolETH,
    feesMevInProgress
  ])

  useEffect(() => {
    if (selectedValidators.length === 1) {
      const selectedNetwork = networks.find(
        (network) => network.id === selectedValidators[0].liquidStakingManager
      )
      setSelectedNetwork(selectedNetwork)
    } else if (selectedValidators.length === 0) {
      setSelectedNetwork(undefined)
    }
  }, [selectedValidators])

  const handleGoNodeRunner = () => {
    navigate('/node_operator')
  }

  const handleFilterNetwork = (e: ChangeEvent<HTMLInputElement>) => {
    setNetworkSearchKey(e.target.value)
    if (networks && e.target.value) {
      setNetworkSearchIds(
        networks
          .filter((network) => network.ticker.toLowerCase().includes(e.target.value.toLowerCase()))
          .map((network) => network.id)
      )
    } else if (!e.target.value) {
      setNetworkSearchIds(networks.map((network) => network.id))
    } else {
      setNetworkSearchIds([])
    }
  }

  const handleToggleSelection = (id: string) => {
    const selectedValidatorIds = selectedValidators.map((v) => v.id)
    if (selectedValidatorIds.includes(id)) {
      setSelectedValidators(selectedValidators.filter((v) => v.id !== id))
    } else {
      const validator = validators.find((v) => v.id === id)
      if (validator) {
        setSelectedValidators([...selectedValidators, validator])
      }
    }
  }

  const handleMint = async () => {
    if (!sdk || !selectedValidators) return

    const blsKeys = selectedValidators.map((v) => v.id)
    setSelectedValidatorsForMint(blsKeys)
  }

  const batchFlow: BATCH_FLOW = useMemo(() => {
    if (selectedValidators.length === 0) return BATCH_FLOW.NONE

    let flow = BATCH_FLOW.MINTING
    selectedValidators.forEach((validator) => {
      if ([LSD_STATUS.READY_TO_STAKE, LSD_STATUS.WAITING_FOR_ETH].includes(validator.status)) {
        flow = BATCH_FLOW.STAKING
      }
    })

    return flow
  }, [selectedValidators])

  const handleOpenConfirmStakeDlg = () => setOpenConfirmStakeDlg(true)
  const handleCloseConfirmStakeDlg = () => setOpenConfirmStakeDlg(false)
  const handleOpenStakeDlg = () => {
    handleCloseConfirmStakeDlg()
    setTimeout(() => {
      setSelectedValidatorsForStake(selectedValidators)
    }, 500)
  }

  const handleClear = () => {
    setSelectedNetwork(undefined)
    setSelectedValidators([])
    setSelectedValidatorsForMint([])
    setSelectedValidatorsForStake([])
  }

  const availableETHToStake = useMemo(() => {
    let remainedFunds = {
      staking: stakingOpenPoolETH + stakingInProgress,
      feesMev: feesMevOpenPoolETH + feesMevInProgress
    }

    if ((batchFlow as BATCH_FLOW) === BATCH_FLOW.STAKING) {
      selectedValidators.forEach((v) => {
        const fund = requiredFunds.find((f) => f.blsKey === v.id)
        remainedFunds = {
          staking: remainedFunds.staking - fund.funds.savETH,
          feesMev: remainedFunds.feesMev - fund.funds.feesAndMEV
        }
      })
    }

    return remainedFunds
  }, [requiredFunds, selectedValidators, batchFlow, stakingOpenPoolETH, feesMevOpenPoolETH])

  return (
    <>
      <ModalApproveMint
        open={approving || failedApprove}
        approving={approving}
        failedApprove={failedApprove}
        onClose={() => {
          setApproving(false)
          setFailedApprove(false)
        }}
      />
      <ModalValidatorMint
        open={selectedValidatorsForMint.length > 0}
        blsPublicKeys={selectedValidatorsForMint}
        liquidStakingManagerAddress={
          selectedValidators.length > 0 ? selectedValidators[0].liquidStakingManager : ''
        }
        onMinted={() => {
          handleClear()
          handleRefresh()
        }}
        onClose={() => {
          handleClear()
          handleRefresh()
        }}
      />
      <ModalConfirmStake
        open={openConfirmStakeDlg}
        onClose={handleCloseConfirmStakeDlg}
        onConfirm={handleOpenStakeDlg}
      />
      <ModalValidatorStake
        open={selectedValidatorsForStake.length > 0}
        blsPublicKeys={selectedValidatorsForStake}
        liquidStakingManagerAddress={
          selectedValidators.length > 0 ? selectedValidators[0].liquidStakingManager : ''
        }
        onStaked={() => {
          handleClear()
          navigate('/')
        }}
        onClose={() => {
          handleClear()
          handleRefresh()
        }}
      />
      <div className="relative w-full mt-3.5 flex items-center gap-10">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-3" />
          <TextInput
            className="bg-grey850 p-2.5 pl-11 rounded-lg border border-innerBorder outline-none text-sm"
            placeholder="Search network"
            value={networkSearchKey}
            onChange={handleFilterNetwork}
          />
        </div>
        <div className="bg-grey900 rounded-md flex items-center p-1">
          {VALIDATOR_FILTER.map((filter) => {
            if (filter.tooltip) {
              return (
                <Tooltip message={filter.tooltip} key={filter.id}>
                  <TabItem
                    key={filter.id}
                    isActive={validatorFilter === filter.id}
                    onClick={() => setValidatorFilter(filter.id)}>
                    {filter.label}
                  </TabItem>
                </Tooltip>
              )
            } else {
              return (
                <TabItem
                  key={filter.id}
                  isActive={validatorFilter === filter.id}
                  onClick={() => setValidatorFilter(filter.id)}>
                  {filter.label}
                </TabItem>
              )
            }
          })}
        </div>
      </div>
      {validators.length > 0 ? (
        <>
          <div className="mt-4 mb-2 rounded-lg border border-innerBorder">
            <table className="w-full table-auto border-collapse">
              <TableHead>
                <tr>
                  <TableHeadCell></TableHeadCell>
                  <TableHeadCell>#</TableHeadCell>
                  <TableHeadCell>
                    <Label>
                      Validator Address <Tooltip message="Validator Address" />
                    </Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">
                      Status <Tooltip message="The status of your validator" />
                    </Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">
                      Network{' '}
                      <Tooltip message="The required fee recipient address for your validator." />
                    </Label>
                  </TableHeadCell>
                  <TableHeadCell>
                    <Label className="justify-center">
                      Actions <Tooltip message="Actions" />
                    </Label>
                  </TableHeadCell>
                </tr>
              </TableHead>
              <tbody>
                {validators
                  .filter((validator) => networkSearchIds.includes(validator.liquidStakingManager))
                  .map((validator, index) => (
                    <ValidatorTableRow
                      networks={networks}
                      batchFlow={batchFlow}
                      selectedValidators={selectedValidators.map((v) => v.id)}
                      key={validator.id}
                      validatorFilter={validatorFilter}
                      order={index}
                      validator={validator}
                      selectedNetwork={selectedNetwork}
                      hasMintable={hasMintableValidator}
                      requiredFund={requiredFunds.find((f) => f.blsKey === validator.id)?.funds}
                      availableETHToStake={availableETHToStake}
                      fundsEligible={
                        stakableValidators.findIndex((v) => v.id === validator.id) > -1
                      }
                      onToggleSelection={handleToggleSelection}
                      onHasMintable={(val) => setHasMintableValidator(val)}
                      setHasMatchingValidators={setHasMatchingValidators}
                    />
                  ))}
                {hasMatchingValidators ? null : (
                  <tr>
                    <td colSpan={5} className="text-center py-2 bg-black text-white">
                      No validator found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex w-full gap-2">
            {[VALIDATOR_FILTER[0].id, VALIDATOR_FILTER[1].id].includes(validatorFilter) && (
              <div className="flex-1">
                <Button
                  className="w-full"
                  onClick={handleOpenConfirmStakeDlg}
                  disabled={[BATCH_FLOW.MINTING, BATCH_FLOW.NONE].includes(batchFlow)}>
                  Stake
                </Button>
              </div>
            )}
            {[VALIDATOR_FILTER[0].id, VALIDATOR_FILTER[2].id].includes(validatorFilter) && (
              <div className="flex-1">
                <Button
                  className="w-full"
                  onClick={handleMint}
                  disabled={(batchFlow as BATCH_FLOW) !== BATCH_FLOW.MINTING}>
                  Mint
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Box>
          <img src={AsssetDetailsSVG} alt="asset details" />
          <div className="text-sm font-medium">
            Valdiators are only available for Node Operators
          </div>
          <Button size="lg" onClick={handleGoNodeRunner}>
            Earn as a Node Operator
          </Button>
        </Box>
      )}
    </>
  )
}

const TableHead = tw.thead`text-xs text-grey300 bg-[#20202480]`
const TableHeadCell = tw.th`px-3 py-3 font-medium`
const Label = tw.div`flex items-center gap-2`
const Box = styled.div`
  ${tw`mx-2 mt-2 border border-solid rounded-lg border-innerBorder flex flex-col items-center gap-8 py-12`}
  img {
    width: 158px;
    height: 80px;
  }
`

const TabItem = styled.div<{ isActive: boolean }>`
  ${tw`flex-1 flex flex-col items-center rounded-md py-2 px-3 cursor-pointer text-xs text-grey300 font-medium`}
  ${(props) => props.isActive && tw`bg-grey200`}
`
