import { API_ENDPOINT } from '@/constants'

const epochs = [1575, 225, 9]

const fetchEpochWiseApr = async (knotId: string) => {
  let data,
    response,
    i = 0

  do {
    response = await fetch(
      `${API_ENDPOINT}/validatorEpochWiseApr?bls_key=${knotId}&epochs=${epochs[i]}`
    )
    i++
    data = await response.json()
  } while (
    response.status === 400 &&
    data === "Required Epochs Doesn't Exist For The Validator Yet"
  )

  return { status: response.status, data }
}

export default fetchEpochWiseApr
