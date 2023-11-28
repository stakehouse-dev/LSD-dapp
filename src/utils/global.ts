import Notify, { ConfigOptions as NotifyConfigOptions } from 'bnc-notify'
import { BigNumber, Contract, ethers, Signer } from 'ethers'
import Noty from 'noty'

import { config } from '@/constants/environment'

export const getLibrary = (provider: any) => {
  return provider
}

export const getBalance = async (tokenContract: Contract, userAddress: string) => {
  try {
    const balance = await tokenContract.balanceOf(userAddress)
    return balance
  } catch (e) {
    return ethers.BigNumber.from('0')
  }
}

export const bigToNum = (balance: ethers.BigNumber) => {
  return Number(ethers.utils.formatEther(balance))
}

export const CURVE_INDEX = 'm_12381_3600_0_0_0'
const BNC_NOTIFY_API_KEY = '7a0a4da1-7c92-46af-a12e-e810c1b39d3e'
export const notifyHash = (
  hash: string,
  { desktopPosition = 'topRight' }: NotifyConfigOptions = {}
) => {
  const notify = Notify({
    dappId: BNC_NOTIFY_API_KEY,
    networkId: config.networkId,
    darkMode: true,
    txApproveReminderTimeout: 20000,
    txStallPendingTimeout: 1800000,
    txStallConfirmedTimeout: 1800000,
    desktopPosition
  })
  notify.hash(hash)
}

export function noty(msg: string, type: Noty.Type = 'alert') {
  const instance = new Noty({
    text: msg,
    theme: 'sunset',
    type,
    timeout: 10000
  })

  instance.on('onClick', async () => {
    await navigator.clipboard.writeText(msg)
    return noty('Error text has been copied to clipboard.', 'info')
  })

  instance.show()
}

export const handleErr = (err: unknown, defaultErr?: string) => {
  // @ts-expect-error
  if (typeof err === 'object' && 'message' in err) {
    // @ts-expect-error
    if (/initials already registered/gi.test(err.message)) {
      return 'This wallet address is already registered with us. Please use a new one'
      // @ts-expect-error
    } else if (/user rejected transaction/gi.test(err.message)) {
      return 'The transaction was rejected by the user.'
      // @ts-expect-error
    } else if (/User denied message signature/gi.test(err.message)) {
      return 'The transaction was rejected by the user.'
      // @ts-expect-error
    } else if (/name already exists/gi.test(err.message)) {
      return 'Brand name already exists.'
      // @ts-expect-error
    } else if (/status must be two/gi.test(err.message)) {
      return 'Lifecycle status must be 2.'
      // @ts-expect-error
    } else if (/exitEpoch is not defined/gi.test(err.message)) {
      return 'The validator is either inactive or has already exited.'
      // @ts-expect-error
    } else if (/sETH Balance found to be less than 12/gi.test(err.message)) {
      return true
      // @ts-expect-error
    } else if (/dETH Balance found to be less than 24/gi.test(err.message)) {
      return true
      // @ts-expect-error
    } else if (/Failed to verify/gi.test(err.message)) {
      return 'Error: Failed to verify sweeps. Please retry'
    } else if (defaultErr) {
      return defaultErr
    } else {
      return (err as any).message
    }
  } else {
    return 'Could not perform this action.'
  }
}

export const humanReadableAddress = (address: string, length: number = 6) =>
  `${address.substring(0, length)}...${address.substring(address.length - 4, address.length)}`

export const bytesForHuman = (bytes: number) => {
  let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  let i = 0

  for (i; bytes > 1024; i++) {
    bytes /= 1024
  }

  return bytes.toFixed(1) + ' ' + units[i]
}

export const weiToEthNum = (balance: BigNumber) => {
  return Number(ethers.utils.formatEther(balance))
}

export const remove0x = (str: string) => {
  if (str.startsWith('0x')) {
    return str.substring(2, str.length)
  }
  return str
}

export function cutDecimals(value: string | number, maxDecimals: number): string {
  const examinedValue = String(value)

  if (examinedValue.includes('.')) {
    const pointIdx = examinedValue.indexOf('.')

    const units = examinedValue.substring(0, pointIdx)
    const decimals = examinedValue.substring(pointIdx, pointIdx + maxDecimals + 1)

    return `${units}${decimals}`
  }

  return examinedValue
}

export function makeFile<T extends Record<any, any> | undefined>(
  file: T,
  name: string
): File | null {
  if (!file) return null
  return new File([JSON.stringify(file, null, 2)], name)
}

export function makeJsonFile<T extends Record<any, any> | undefined>(file: T, name: string) {
  return makeFile(file, name)
}

export function getUnixTimestamp() {
  return Math.floor(new Date().getTime() / 1000)
}

export function makeDepositObjectFilename() {
  const timestamp = getUnixTimestamp()
  return `deposit_data-${timestamp}.json`
}

export function makeKeystoreFilename() {
  const timestamp = getUnixTimestamp()
  return `keystore-${CURVE_INDEX}-${timestamp}.json`
}

export function makeRecoveryKeyFilename() {
  const timestamp = getUnixTimestamp()
  return `recovery-${timestamp}.json`
}

export async function parseFileAsJson<T>(file: File): Promise<T> {
  const text = await file.text()
  return JSON.parse(text)
}

export const pad0x = (str: string) => `0x${str}`
export const MIN_BALANCE = ethers.utils.parseEther('32.0')

export function isTxRejectedByUser(err: any): boolean {
  const USER_DENIED_CODE = 4001
  return err?.code === USER_DENIED_CODE || err?.code === 'ACTION_REJECTED'
}

export const changeInput = (val: string) => {
  if (val.includes('.')) {
    const belowDotNumbers = val.split('.')[1]
    const fixedBelowDotNumbers = belowDotNumbers.slice(0, 3)
    const fullNumber = `${val.split('.')[0]}.${fixedBelowDotNumbers}`
    return fullNumber
  } else {
    return val
  }
}

export const roundNumber = (val: number, count: number) =>
  val.toLocaleString(undefined, { maximumFractionDigits: count })

export function makeBeaconLink(account: string) {
  return `${
    process.env.REACT_APP_NETWORK_ID ? 'https://beaconcha.in' : 'https://prater.beaconcha.in'
  }/validator/${remove0x(account)}`
}

export const getMinuteDuration = (from: number) => {
  return Math.floor(45 - (new Date().getTime() / 1000 - from) / 60)
}

export const isEligibleToInteractWithGiantLPToken = async (
  signer: Signer,
  lastInteractedTimestamp: any
) => {
  if (!signer.provider) return false

  const currentBlock = await signer.provider.getBlockNumber()
  const blockTimestamp = (await signer.provider.getBlock(currentBlock)).timestamp
  const blockTimestampBN = ethers.BigNumber.from(blockTimestamp)

  const oneDay = 45 * 60
  const eligibleTimestamp = lastInteractedTimestamp.add(ethers.BigNumber.from(oneDay))

  return blockTimestampBN.gte(eligibleTimestamp)
}

export const convertDateToString = (duration: number) => {
  let dateString = ''
  if (duration === 0) return '00 : 00 : 00'

  if (Math.floor(duration / 60) > 0) {
    const seconds = duration % 60
    dateString = seconds.toString().padStart(2, '0')
    const minDuration = Math.floor(duration / 60)

    if (minDuration / 60 > 0) {
      const minutes = minDuration % 60
      dateString = `${minutes.toString().padStart(2, '0')} : ${dateString}`
      const hourDuration = Math.floor(minDuration / 60)

      dateString = `${hourDuration.toString().padStart(2, '0')} : ${dateString}`
    } else {
      dateString = `00 : ${minDuration.toString().padStart(2, '0')} : ${dateString}`
    }
  } else {
    dateString = `00 : 00 : ${duration.toString().padStart(2, '0')}`
  }

  return dateString
}
