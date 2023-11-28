import { ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils.js'
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { useBalance } from 'wagmi'

import ArrowLeftSVG from '@/assets/images/arrow-left.svg'
import { ReactComponent as ArrowRightIcon } from '@/assets/images/arrow-right-green.svg'
import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ReactComponent as EthIcon } from '@/assets/images/icon-blue-eth.svg'
import { ReactComponent as DETHIcon2 } from '@/assets/images/icon-deth.svg'
import { ReactComponent as DETHIcon } from '@/assets/images/icon-deth3.svg'
import { ReactComponent as BlackETHIcon } from '@/assets/images/icon-eth2.svg'
import { ModalRedeemETH, ModalReportBalanceForRedeem } from '@/components/app'
import { ModalFacilitateConfirm } from '@/components/app/Modals/ModalFacilitateConfirm'
import {
  Button,
  ClipboardCopy,
  CompletedTxView,
  ErrorModal,
  LoadingModal,
  ModalDialog,
  Spinner,
  TextInput,
  Tooltip
} from '@/components/shared'
import { BEACON_NODE_URL } from '@/constants/chains'
import { config } from '@/constants/environment'
import {
  useCustomAccount,
  useMakeRealTxHash,
  useNetworkBasedLinkFactories,
  useSDK,
  useUser
} from '@/hooks'
import { useTotalAvailableETH } from '@/hooks'
import { EligibleValidator, FinalizedReport } from '@/types'
import {
  bigToNum,
  humanReadableAddress,
  makeBeaconLink,
  notifyHash,
  roundNumber
} from '@/utils/global'

const statusPriority: Record<string, number> = {
  facilitated: 1,
  deploy: 2,
  facilitate: 2
}

export const Facilitator = () => {
  const navigate = useNavigate()

  const { sdk } = useSDK()
  const { setFacilitateInfo, facilitateInfo } = useUser()

  const [loading, setLoading] = useState(false)
  const [validators, setValidators] = useState<any>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false)
  const [borrowAvailable, setBorrowAvailable] = useState<boolean>(false)

  const { account } = useUser()

  const { data: { formatted: dETHBalance } = {} } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    token: config.dethTokenAddress as `0x${string}`,
    chainId: config.networkId
  })

  const { data: { formatted: ethBalance } = {} } = useBalance({
    address: account?.address,
    formatUnits: 'ether',
    chainId: config.networkId
  })

  useEffect(() => {
    const fetchValidators = async () => {
      setLoading(true)

      const validators = await sdk?.withdrawal.getListOfBlsKeysForRageQuitDETH(BEACON_NODE_URL)

      setValidators(validators)
      setLoading(false)
    }

    fetchValidators()
  }, [])

  const onBack = () => {
    navigate('/')
  }

  const handleConfirm = () => {
    setIsOpen(false)
    setIsGuideModalOpen(true)

    setTimeout(() => {
      setIsGuideModalOpen(false)
      navigate('/facilitator/ragequit')
    }, 3000)
  }

  const handleFacilitate = (info: any) => {
    setBorrowAvailable(info.borrowFundsAvailable)
    setFacilitateInfo(info)
    setIsOpen(true)
  }

  return (
    <div className="text-white py-10 flex flex-col mx-auto flex-1 w-full items-center">
      <div className="w-full text-center text-32 font-semibold flex items-center gap-4 justify-center">
        <img src={ArrowLeftSVG} className="icon-left-arrow" onClick={onBack} />
        <span className="text-primary">Available</span> Validators
      </div>
      <div className="text-grey700 text-center mt-2">
        Supply dETH to validators willing to exit but without capital. <br />
        It’s the simplest way to get ETH for your dETH without going to DEX
      </div>
      <Stats>
        <div className="w-full flex flex-col gap-2">
          <div>Your dETH</div>
          <div className="text-2xl text-primary font-semibold flex gap-2 items-center">
            <DETHIcon />
            {Number(dETHBalance).toLocaleString(undefined, {
              maximumFractionDigits: 3
            })}
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div>Your ETH</div>
          <div className="text-2xl text-primary font-semibold flex gap-2 items-center">
            <EthIcon />
            {Number(ethBalance).toLocaleString(undefined, {
              maximumFractionDigits: 3
            })}
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div>Available to swap</div>
          <div className="text-2xl text-primary font-semibold flex gap-2 items-center">
            {Number(dETHBalance).toLocaleString(undefined, {
              maximumFractionDigits: 3
            })}{' '}
            dETH
          </div>
        </div>
      </Stats>
      <div className="mt-2 flex justify-between text-sm text-grey550 px-2 mb-8 max-w-xl w-full">
        <span>-</span>
        <span>
          Wallet Balance:{' '}
          {Number(dETHBalance).toLocaleString(undefined, {
            maximumFractionDigits: 3
          })}{' '}
          dETH
        </span>
      </div>
      <TableWrapper>
        <table className="w-full table-auto border-collapse">
          <TableHead>
            <tr>
              <TableHeadCell>
                <Label>Validator</Label>
              </TableHeadCell>
              <TableHeadCell>
                <Label className="justify-center">
                  Asking <Tooltip message="Amount of dETH required for rage quitting" />
                </Label>
              </TableHeadCell>
              <TableHeadCell>
                <Label className="justify-center">
                  Giving
                  <Tooltip message="Amount of ETH the depositor will receive" />
                </Label>
              </TableHeadCell>
              <TableHeadCell>
                <Label className="justify-center">
                  Exit epoch
                  <Tooltip message="Epoch in which the validator has exited/will exit the consensus layer" />
                </Label>
              </TableHeadCell>
              <TableHeadCell>
                <Label className="justify-center">Status</Label>
              </TableHeadCell>
              <TableHeadCell></TableHeadCell>
            </tr>
          </TableHead>
          <tbody>
            {loading && (
              <tr className="border-t border-innerBorder bg-grey900 text-sm font-medium">
                <TableCell colSpan={6}>
                  <div className="w-full flex items-center justify-center py-10">
                    <Spinner />
                  </div>
                </TableCell>
              </tr>
            )}
            {!loading &&
              validators &&
              validators.length > 0 &&
              validators
                .sort(
                  (a: any, b: any) =>
                    Number(a.borrowFundsAvailable) - Number(b.borrowFundsAvailable)
                )
                .sort((a: any, b: any) => b.exitEpoch - a.exitEpoch)
                .sort((a: any, b: any) => a.dETHRequired - b.dETHRequired)
                .sort((a: any, b: any) => statusPriority[b.status] - statusPriority[a.status])
                .map((item: any, index: number) => {
                  const isFacilitated = item.status == 'facilitated'

                  return (
                    <tr
                      key={index}
                      className={`border-t border-innerBorder bg-grey900 text-sm font-medium ${
                        isFacilitated ? 'text-grey550' : ''
                      }`}>
                      <TableCell className={`${isFacilitated && 'border-l-2 border-primary'}`}>
                        <Label>
                          <ClipboardCopy copyText={item.blsPublicKey}>
                            {humanReadableAddress(item.blsPublicKey, 9)}
                          </ClipboardCopy>
                          <ArrowTopRightIcon
                            className="cursor-pointer"
                            onClick={() => window.open(makeBeaconLink(item.blsPublicKey), '_blank')}
                          />
                        </Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="justify-center">
                          {Number(formatEther(item.dETHRequired)).toLocaleString(undefined, {
                            maximumFractionDigits: 3
                          })}
                          <DETHIcon2 />
                        </Label>
                      </TableCell>
                      <TableCell className="text-center ">
                        <Label className="justify-center">
                          {Number(formatEther(item.dETHRequired)).toLocaleString(undefined, {
                            maximumFractionDigits: 3
                          })}
                          <BlackETHIcon />
                        </Label>
                      </TableCell>
                      <TableCell className="text-center ">
                        <Label className="justify-center">{item.exitEpoch}</Label>
                      </TableCell>
                      <TableCell className="text-center ">
                        <Label className="justify-center">{item.status}</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        {isFacilitated ? (
                          <Label
                            className="text-primary justify-center cursor-pointer"
                            onClick={() => handleFacilitate(item)}>
                            Facilitated <ArrowTopRightIcon />
                          </Label>
                        ) : (
                          <Button onClick={() => handleFacilitate(item)}>Facilitate</Button>
                        )}
                      </TableCell>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </TableWrapper>
      {/* <CTA>
        ARE YOU A NODE RUNNER? REGISTER HERE <ArrowRightIcon />
      </CTA> */}
      <ModalFacilitateConfirm
        open={isOpen}
        borrowAvailable={borrowAvailable}
        isFacilitated={facilitateInfo.status == 'facilitated'}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
      <LoadingModal
        open={isGuideModalOpen}
        onClose={() => {}}
        title="We're guiding you to wrap up the Validator's exit journey.."
      />
    </div>
  )
}

const Stats = styled.div`
  ${tw`px-8 py-4 bg-primary100 rounded-2xl flex gap-6 max-w-xl w-full mt-5`}
`

const TableHead = tw.thead`text-xs text-grey300 bg-[#26272C]`
const TableHeadCell = tw.th`px-3 py-3 font-medium`
const TableCell = tw.td`px-3 content-center h-14`

const Label = tw.div`flex items-center gap-2`
const TableWrapper = styled.div`
  ${tw`rounded-lg border border-innerBorder overflow-hidden max-w-3xl w-full`}
`

const CTA = styled.div`
  ${tw`flex items-center gap-2 font-medium text-xl mt-8 text-primary`}
  text-shadow: 1px 1px 4px #00ED76;
`
