import { useQuery } from '@apollo/client'
import { Dialog } from '@headlessui/react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import tw from 'twin.macro'
import { useBlockNumber } from 'wagmi'

import { ReactComponent as CloseCircleIcon } from '@/assets/images/close-circle.svg'
import { ReactComponent as RedAlertIcon } from '@/assets/images/icon-alert-red.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import styles from '@/components/app/Modals/styles.module.scss'
import { Checkbox, ClipboardCopy, Modal } from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { LSD_STATUS } from '@/constants/lsdStatus'
import { RewardsContext } from '@/context/RewardsContext'
import { AllLSDNetworksQuery } from '@/graphql/queries/LSDNetworks'
import { LsdValidatorsQuery } from '@/graphql/queries/lsdValidators'
import { useNetworkBasedLinkFactories, useSDK } from '@/hooks'
import { TLSDNetwork, TLSDValidator, ValidatorLifecycleStatuses, ValidatorT } from '@/types'
import { humanReadableAddress } from '@/utils/global'

import { ActionBtn } from './ActionBtn'
import { BATCH_FLOW } from './Validators'
import { ValidatorStatus } from './ValidatorStatus'

type ValidatorTableRowType = {
  validator: TLSDValidator
  order: number
  batchFlow: BATCH_FLOW
  selectedValidators: string[]
  fundsEligible: boolean
  hasMintable: any
  networks: TLSDNetwork[]
  validatorFilter: number
  selectedNetwork: TLSDNetwork | undefined
  requiredFund: { savETH: number; feesAndMEV: number; directDeposit: boolean } | undefined
  availableETHToStake: { staking: number; feesMev: number }
  onToggleSelection: (id: string) => void
  onHasMintable: (val: any) => void
  setHasMatchingValidators: (val: boolean) => void
}

export const ValidatorTableRow = ({
  validator,
  order,
  batchFlow,
  selectedValidators,
  fundsEligible,
  hasMintable,
  networks,
  validatorFilter,
  selectedNetwork,
  requiredFund,
  availableETHToStake,
  onToggleSelection,
  onHasMintable,
  setHasMatchingValidators
}: ValidatorTableRowType) => {
  const [isStakable, setIsStakable] = useState(false)
  const [isMintable, setIsMintable] = useState(false)
  const [isMintEligible, setIsMintEligible] = useState(false)
  const [openNotEligibleModal, setOpenNotEligibleModal] = useState(false)

  const { rewards } = useContext(RewardsContext)

  const { sdk } = useSDK()
  const { data } = useBlockNumber()
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  const { data: { liquidStakingNetworks } = {} } = useQuery(AllLSDNetworksQuery)
  const { data: sValidators } = useQuery(LsdValidatorsQuery, {
    variables: { blsPublicKey: validator.id },
    skip: !validator.id,
    fetchPolicy: 'network-only'
  })

  const checkStakable = useCallback(async () => {
    if (!sdk) return

    let isBanned = false
    try {
      isBanned = await sdk.wizard.isBLSPublicKeyBanned(validator.liquidStakingManager, validator.id)
    } catch (err) {
      isBanned = true
    }
    setIsStakable(!isBanned)
  }, [validator, sdk])

  useEffect(() => {
    checkStakable()
  }, [checkStakable])

  const sValidator: ValidatorT = sValidators?.stakehouseAccounts
    ? sValidators?.stakehouseAccounts[0]
    : null

  useEffect(() => {
    if (
      sValidator &&
      data &&
      sValidator.mintFromBlockNumber &&
      sValidator.lifecycleStatus === ValidatorLifecycleStatuses.depositCompleted &&
      data > Number(sValidator.mintFromBlockNumber)
    ) {
      setIsMintable(true)
      onHasMintable({ ...hasMintable, [validator.liquidStakingManager]: true })
      return
    }

    setIsMintable(false)
  }, [sValidator, data, validator])

  useEffect(() => {
    if (validator.status === LSD_STATUS.STAKED) {
      onHasMintable({ ...hasMintable, [validator.liquidStakingManager]: true })
    }
  }, [validator])

  useEffect(() => {
    const fetchMintEligibility = async () => {
      if (isMintable && sdk && validator) {
        const finalisedEpochReport = await sdk.balanceReport.getFinalisedEpochReport(
          BEACON_NODE_URL,
          validator.id
        )
        const { activationEpoch, currentCheckpointEpoch, activeBalance } = finalisedEpochReport

        if (
          Number(activationEpoch) < Number(currentCheckpointEpoch) &&
          Number(activeBalance) >= Number('32000000000')
        ) {
          setIsMintEligible(true)
        }
      }
    }
    fetchMintEligibility()
  }, [isMintable, sdk, validator])

  const rageQuitedValidators: string[] = useMemo(() => {
    const stringValue = localStorage.getItem('ragequit')
    if (stringValue) {
      return JSON.parse(stringValue) as string[]
    }

    return []
  }, [])

  const exitedValidators: string[] = useMemo(() => {
    const stringValue = localStorage.getItem('exitedValidators')
    if (stringValue) {
      return JSON.parse(stringValue) as string[]
    }

    return []
  }, [])

  const isCheckable = useMemo(() => {
    if (selectedNetwork && validator.liquidStakingManager !== selectedNetwork.id) return false

    if (batchFlow !== BATCH_FLOW.STAKING && isMintable) {
      return true
    }

    if (
      batchFlow !== BATCH_FLOW.MINTING &&
      isStakable &&
      fundsEligible &&
      (requiredFund?.savETH || 0) <= availableETHToStake.staking &&
      (requiredFund?.feesAndMEV || 0) <= availableETHToStake.feesMev &&
      !requiredFund?.directDeposit &&
      !hasMintable[validator.liquidStakingManager]
    ) {
      return true
    }

    return false
  }, [
    batchFlow,
    isMintable,
    validator,
    isStakable,
    selectedNetwork,
    hasMintable,
    fundsEligible,
    requiredFund,
    availableETHToStake
  ])

  const hadleToggleSelection = () => {
    if (!isMintable) return onToggleSelection(validator.id)

    if (isMintEligible) return onToggleSelection(validator.id)

    setOpenNotEligibleModal(true)
  }

  if (
    validatorFilter === 0 ||
    (validatorFilter === 1 && fundsEligible && isStakable) ||
    (validatorFilter === 2 && isMintable)
  ) {
    setHasMatchingValidators(true)
    return (
      <tr
        key={validator.id}
        className="border-t border-innerBorder text-sm font-medium"
        style={{ zIndex: 10000 - order }}>
        <TableCell>
          <Checkbox
            label=""
            disabled={!isCheckable && !selectedValidators.includes(validator.id)}
            checked={selectedValidators.includes(validator.id)}
            onChange={hadleToggleSelection}
          />
        </TableCell>
        <TableCell>{order}</TableCell>
        <TableCell>
          <ClipboardCopy copyText={validator.id}>
            {humanReadableAddress(validator.id, 9)}
          </ClipboardCopy>
        </TableCell>
        <TableCell className="text-center">
          <ValidatorStatus
            id={validator.id}
            status={validator.status}
            isExiting={rageQuitedValidators.includes(validator.id)}
            isExited={exitedValidators.includes(validator.id)}
            isStakable={isStakable}
            directDeposit={!!requiredFund?.directDeposit}
            fundsEligible={fundsEligible}
            isMintable={isMintable}
          />
        </TableCell>
        <TableCell className="text-center">
          <Label
            onClick={(e) => {
              window.open(
                makeEtherscanLink(
                  liquidStakingNetworks.find(
                    (network: any) => network.id === validator.liquidStakingManager
                  )?.feeRecipientAndSyndicate,
                  false,
                  true
                ),
                '_blank'
              )
            }}>
            {networks.find((network) => network.id === validator.liquidStakingManager)?.ticker}
            <ArrowTopRightIcon />
          </Label>
        </TableCell>
        <TableCell className="flex justify-center items-center">
          <ActionBtn
            status={validator.status}
            order={10000 - order}
            isExitable={!rewards?.nodeOperator[validator.liquidStakingManager]}
            blsKey={validator.id}
          />
        </TableCell>
        <Modal open={openNotEligibleModal} onClose={() => setOpenNotEligibleModal(false)}>
          <Dialog.Panel className={styles.modalLayoutBig}>
            <div
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setOpenNotEligibleModal(false)}>
              <CloseCircleIcon />
            </div>
            <div className={styles.confirmDepositFailed}>
              <RedAlertIcon />
              <p className={styles.modalTitle}>Validator Not Eligible</p>
              <p className={styles.confirmDepositDesc}>
                Please ensure your validator is active on the <a>consensus layer</a> and has a
                balance of 32+ ETH.
              </p>
            </div>
          </Dialog.Panel>
        </Modal>
      </tr>
    )
  }

  return <></>
}

const TableCell = tw.td`px-3 content-center h-14`
const Label = tw.div`flex justify-center items-center gap-2 cursor-pointer`
