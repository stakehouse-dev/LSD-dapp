import { useEffect, useRef, useState } from 'react'

import { API_ENDPOINT } from '../constants'

export const useIndexValidators = (indexId: string) => {
  const cache = useRef<Record<string, any>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>({})
  const [numberOfKnots, setNumberOfKnots] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (cache.current[indexId]) {
          const validators = cache.current[indexId]
          setData(validators)
          setNumberOfKnots(Object.keys(validators).length)
        } else {
          const { validators } = await fetch(
            `${API_ENDPOINT}/indexValidators?index=${indexId}`
          ).then((res) => res.json())
          cache.current[indexId] = validators
          setData(validators)
          setNumberOfKnots(Object.keys(validators).length)
        }
      } catch (error) {
        console.log('fetch indexValidators error: ', error)
      }
      setLoading(false)
    }
    if (indexId) fetchData()
  }, [indexId])

  return { data, numberOfKnots, loading }
}
