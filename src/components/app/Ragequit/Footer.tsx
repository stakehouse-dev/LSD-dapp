import { ReactComponent as EthIcon } from '@/assets/images/icon-eth.svg'
import { bigToNum, roundNumber } from '@/utils/global'

interface FooterProps {
  values?: any
}

export const RageQuitFooter = ({ values }: FooterProps) => {
  return (
    <div className="p-4 bg-grey900 flex flex-col gap-2 max-w-xl w-full mx-auto rounded-2xl text-sm">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-white">
          <EthIcon />
          <p>ETH to Supply</p>
        </div>
        <p className="text-grey700">
          {values?.ethToSupply ? roundNumber(bigToNum(values.ethToSupply), 2) : 0} ETH
        </p>
      </div>
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-white">
          <EthIcon />
          <p>dETH to Burn</p>
        </div>
        <p className="text-grey700">24.0 dETH</p>
      </div>
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-white">
          <EthIcon />
          <p>SLOT to Burn</p>
        </div>
        <p className="text-grey700">8.0 sETH</p>
      </div>
    </div>
  )
}
