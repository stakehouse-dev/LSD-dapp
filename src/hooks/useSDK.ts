import { useContext } from 'react'

import { BlockswapSDKContext } from '@/context/BlockswapSDKContext'

export function useSDK() {
  const { sdk } = useContext(BlockswapSDKContext)

  return {
    sdk
  }
}
