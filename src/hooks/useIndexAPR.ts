import { useEffect, useState } from 'react'

import { API_ENDPOINT } from '@/constants'

import { IIndexAPR } from '../types'

export const useIndexAPR = (indexId: string) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<IIndexAPR>()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const _data = await fetch(`${API_ENDPOINT}/indexAPRAverage?index=${indexId}`).then((res) =>
        res.json()
      )
      setData(_data)

      setLoading(false)
    }
    if (indexId) fetchData()
  }, [indexId])

  return { data, loading }
}
