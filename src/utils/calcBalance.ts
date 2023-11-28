import { formatEther } from 'ethers/lib/utils'

export const calcBalance = (batches: any) => {
  let amount = 0,
    withdrawn = 0
  batches.map((item: any) => {
    amount += Number(formatEther(item.liquidityProviders[0].amount))
    withdrawn += Number(formatEther(item.liquidityProviders[0].withdrawn))
  })

  return amount - withdrawn
}

export const calcPoolBalance = (lps: any) => {
  return lps.reduce((prev: number, current: any) => {
    let amount = current.liquidityProviders[0].amount
      ? Number(formatEther(current.liquidityProviders[0].amount))
      : 0
    let withdrawn = current.liquidityProviders[0].withdrawn
      ? Number(formatEther(current.liquidityProviders[0].withdrawn))
      : 0
    return prev + amount - withdrawn
  }, 0)
}
