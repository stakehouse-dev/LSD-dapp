import { useQuery } from '@apollo/client'
import BN from 'bignumber.js'
import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { OpenIndexDETHQuery } from '@/graphql/queries/knot'

import { usePortfolioProtectedBatch } from './usePortfolioProtectedBatch'
import { useSDK } from './useSDK'

type IStakehouseAccount = {
  id: string
  totalDETHMinted: number
}

export const useMyAssetData = () => {
  const [totaldETH, setTotaldETH] = useState<string>('0')
  const [totalsavETH, setTotalsavETH] = useState<string>('0')
  const [loading, setLoading] = useState<boolean>(false)
  const { knotIds, numberOfKnots, validator_earnings } = usePortfolioProtectedBatch()
  const { sdk } = useSDK()

  const { data } = useQuery(OpenIndexDETHQuery, {
    variables: { knots: knotIds },
    fetchPolicy: 'network-only',
    skip: numberOfKnots === 0
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      if (sdk) {
        try {
          const { stakehouseAccounts } = data

          const dETH = stakehouseAccounts.reduce((sum: BN, current: IStakehouseAccount) => {
            return new BN(current.totalDETHMinted).times(validator_earnings[current.id]).plus(sum)
          }, new BN(0))

          const savETH = await sdk.utils.dETHToSavETH(dETH.toFixed(0))

          const _totaldETH = ethers.utils.formatEther(BigNumber.from(dETH.toFixed(0)))
          const _totalsavETH = Number(ethers.utils.formatEther(savETH)).toLocaleString(undefined, {
            maximumFractionDigits: 3
          })

          setTotaldETH(_totaldETH)
          setTotalsavETH(_totalsavETH)
        } catch (error) {
          console.log(error)
        }
      }
      setLoading(false)
    }

    if (typeof window !== 'undefined' && data && sdk) fetchData()
  }, [data, sdk])

  return { dETH: totaldETH, savETH: totalsavETH, loading }
}
