import { useEffect, useState } from 'react'
import { theme } from 'twin.macro'

import { API_ENDPOINT } from '../constants'

export const useLSDScore = (knotId: string, isInViewPort: boolean) => {
  const [score, setScore] = useState<string>('')
  const [topups, setTopups] = useState<string>('')

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const { validator_score, top_ups } = await fetch(
          `${API_ENDPOINT}/validatorLSDScore?bls_key=${knotId}`
        ).then((res) => res.json())

        const _topups =
          Number(top_ups) > 0.001
            ? Number(top_ups).toLocaleString(undefined, { maximumFractionDigits: 3 })
            : Number(top_ups) === 0
            ? '0'
            : '< 0.001'
        setTopups(_topups)
        setScore(validator_score)
      } catch (error) {
        console.log('fetch validatorLSDScore error: ', error)
      }
    }

    if (isInViewPort && knotId) fetchScore()
  }, [isInViewPort, knotId])

  return {
    color:
      Number(score) === 0
        ? theme`colors.primary500`
        : Number(score) === 1
        ? theme`colors.yellow300`
        : theme`colors.red200`,
    topups
  }
}
