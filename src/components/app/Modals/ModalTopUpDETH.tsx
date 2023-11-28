import { BigNumber } from 'ethers'
import { useBalance } from 'wagmi'

import { Button, DefaultModalView, LoadingModal, ModalDialog, TextInput } from '@/components/shared'
import { config } from '@/constants/environment'
import { useCustomAccount } from '@/hooks'
import { is0xPrefixed } from '@/utils/address'
import { bigToNum, roundNumber } from '@/utils/global'

import styles from './styles.module.scss'

interface ModalTopUpSlotProps {
  open: boolean
  amount?: BigNumber
  loading?: boolean
  onClose: () => void
  onSubmit: () => void
}

export const ModalTopUpDETH = ({
  open,
  amount,
  loading,
  onClose,
  onSubmit
}: ModalTopUpSlotProps) => {
  const { account } = useCustomAccount()
  const address = account?.address

  const { data: { formatted: availableAmount } = {}, refetch } = useBalance({
    address: address,
    formatUnits: 'ether',
    token: is0xPrefixed(config.dethTokenAddress) ? config.dethTokenAddress : undefined,
    chainId: config.networkId
  })

  if (loading) {
    return <LoadingModal open={loading} onClose={() => {}} title="Confirmation Pending" />
  }

  return (
    <ModalDialog open={open} onClose={onClose} controlsClosableOnly>
      <DefaultModalView title="Deposit dETH" className="w-full">
        <div className="flex flex-col w-full gap-1 relative">
          <TextInput
            title="Total balance of dETH to deposit"
            className={styles.input}
            tooltip="As a node operator it is required that you have a validator in good health to remove it from Stakehouse."
            disabled
            value={amount ? bigToNum(amount) : 0}
          />
          <span className="text-white text-lg absolute top-2 right-2">dETH</span>
          <p className="text-right text-sm text-grey600 mb-1">
            Available: {availableAmount ? roundNumber(Number(availableAmount), 3) : 0} dETH
          </p>
          <Button
            size="lg"
            className="w-full"
            disabled={amount && Number(availableAmount) < bigToNum(amount)}
            onClick={onSubmit}>
            Confirm
          </Button>
        </div>
      </DefaultModalView>
    </ModalDialog>
  )
}
