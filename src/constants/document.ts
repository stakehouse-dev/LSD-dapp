import { WITHDRAW_MODE } from '.'

const documentByMode = (mode: WITHDRAW_MODE, account: string, validatorId?: string) => {
  switch (mode) {
    case WITHDRAW_MODE.STAKING:
      return `{
        lptokens(where:{
          liquidityProviders_:{
            lpAddress:"${account}"
          } 
          lifecycleStatus_in:["STAKED", "MINTED_DERIVATIVES"]
          tokenType:"PROTECTED_STAKING_LP"
        }) { 
          id
          lifecycleStatus
          liquidityProviders(where:{
            lpAddress:"${account}"
          }) {
            lpAddress
            amount
            withdrawn
          }
        }
        protectedBatches(where:{
          liquidityProviders_:{
            lpAddress:"${account}"
          }
          lsdValidator_:{
            status_in:["STAKED", "MINTED_DERIVATIVES"]
          } 
        }) {
          id
          lsdValidator {
            id
            status
          }
          vaultLPToken {
            id
            tokenType
          }
          liquidityProviders(where:{
            lpAddress:"${account}"
          }) {
            lpAddress
            amount
            withdrawn
          }
        }
      }
        `
    case WITHDRAW_MODE.FEES_MEV:
      return `{
        lptokens(where:{
          liquidityProviders_:{
            lpAddress:"${account}"
          } 
          lifecycleStatus_in:["STAKED", "MINTED_DERIVATIVES"]
          tokenType:"FEES_AND_MEV_LP"
        }) {
          id
          lifecycleStatus
          liquidityProviders(where:{
            lpAddress:"${account}"
          }) {
            lpAddress
            amount
            withdrawn
          }
        }
        feesAndMevBatches(where:{
          liquidityProviders_:{
            lpAddress:"${account}"
          }
          lsdValidator_:{
            status_in:["STAKED", "MINTED_DERIVATIVES"]
          }
        }) {
          id
          lsdValidator {
            id
            status
          }
          vaultLPToken {
            id
            tokenType
          }
          liquidityProviders(where:{
            lpAddress:"${account}"
          }) {
            lpAddress
            amount
            withdrawn
          }
        }
      }
      `
    default:
      return `{
            nodeRunners(where: {
              id: "${account}"
              validators_: {
                status: "MINTED_DERIVATIVES"
              }
            }) {
              id
              name
              liquidStakingNetworks {
                id
                ticker
                commission
                feeRecipientAndSyndicate
              }
              validators(where: {
                status: "MINTED_DERIVATIVES"
              }) {
                id
                currentIndex
                status
              }
            }
          }
          `
  }
}

export default documentByMode
