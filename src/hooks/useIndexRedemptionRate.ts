import { useEffect, useState } from 'react'

import { API_ENDPOINT } from '../constants'

export const useIndexRedemptionRate = (indexId: string | undefined) => {
  const [rate, setRate] = useState<string>()
  const [color, setColor] = useState<string>()

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const { redemptionRate, colour } = await fetch(
          `${API_ENDPOINT}/indexRedemptionRate?index=${indexId}`
        ).then((res) => res.json())

        setRate(Number(redemptionRate).toLocaleString(undefined, { maximumFractionDigits: 3 }))
        setColor(colour)
      } catch (error) {
        console.log('fetch indexRedemptionRate error: ', error)
      }
    }

    if (indexId) fetchScore()
  })

  return {
    rate,
    color
  }
}
