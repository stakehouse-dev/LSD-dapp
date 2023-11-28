import { useSearchParams } from 'react-router-dom'

export function useQueryString() {
  const [searchParams] = useSearchParams()
  return searchParams
}
