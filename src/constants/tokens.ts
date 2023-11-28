import { ethers } from 'ethers'

import GreenETHIcon from '@/assets/images/icon-deth.svg'
import ETHIcon from '@/assets/images/icon-eth.svg'

import { config } from './environment'

export type TokenT = {
  id: number
  symbol: string
  label: string
  icon: string
  address?: string
}

export const DETH: TokenT = {
  id: 2,
  symbol: 'dETH',
  label: 'Stakehouse Derivative ETH',
  icon: GreenETHIcon,
  address: config.dethTokenAddress
}

export const ETH: TokenT = {
  id: 5,
  symbol: 'ETH',
  label: 'Ethereum',
  icon: ETHIcon,
  address: ethers.constants.AddressZero
}

export const DETH_WITHDRAW_TOKENS: TokenT[] = [DETH, ETH]
