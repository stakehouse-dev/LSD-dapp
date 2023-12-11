import { FC } from 'react'

import { ACTIVITY_TYPE } from '@/constants/activity'
import { useNetworkBasedLinkFactories } from '@/hooks'

const Description: FC<{ activity: any; blsKeyToTxHashes: any }> = ({
  activity,
  blsKeyToTxHashes
}) => {
  const { makeEtherscanLink } = useNetworkBasedLinkFactories()

  switch (activity.key) {
    case ACTIVITY_TYPE.ETH_DEPOSITED_BY_STAKER:
      return (
        <span className="description">
          Deposited ETH (Giant){' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.BLS_PUBLIC_KEY_WITHDRAWN:
      return (
        <span className="description">
          Withdraw ETH (Node){' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.PROTECTED_STAKING_LP_BURNED:
      return (
        <span className="description">
          Withdraw ETH (Fren){' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.LP_BURNED_FOR_ETH:
      return (
        <span className="description">
          Burned Giant LP Token for ETHs{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.GIANT_LP_SWAPPED:
      return (
        <span className="description">
          Swapped Giant LP Token for LSD Pool Token{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.SMART_WALLET_CREATED:
      return (
        <span className="description">
          Created a smart wallet{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.NEW_VALIDATOR_REGISTERED:
      return (
        <span className="description">
          Registered a new validator{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.LP_TOKEN_ISSUED:
      return (
        <span className="description">
          Minted new LP Token{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.LP_TOKEN_MINTED:
      return (
        <span className="description">
          Minted LP Token{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.KNOT_STAKED:
      return (
        <span className="description">
          Staked a new KNOT{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.STAKEHOUSE_CREATED:
      return (
        <span className="description">
          Minted dETH and SLOT tokens{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.STAKEHOUSE_JOINED:
      return (
        <span className="description">
          Minted dETH and SLOT tokens{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.GIANT_LP_BURNED_FOR_DETH:
      return (
        <span className="description">
          Claimed dETH{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.DETH_CLAIMED:
      return (
        <span className="description">
          Claimed dETH{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.FEES_AND_MEV_CLAIMED:
      return (
        <span className="description">
          Claimed Fees and MEV rewards{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.NODE_RUNNER_REWARDS_CLAIMED:
      return (
        <span className="description">
          Claimed node operator rewards{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.NODE_RUNNER_NAME_UPDATED:
      return (
        <span className="description">
          Updated node runner name{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.VALIDATOR_UNSTAKED:
      return (
        <span className="description">
          Validator Unstaked{' '}
          {`${activity.blsPubKeyForKnot.slice(0, 6)}...${activity.blsPubKeyForKnot.slice(-6)}`}{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.LSDN_DEPLOYED:
      return (
        <span className="description">
          LSDN Network Deployed{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.RAGE_QUIT_ASSISTANT_DEPLOYED:
      return (
        <span className="description">
          Rage Quit Assistant Deployed{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.RAGE_QUIT_LP_MINTED:
      return (
        <span className="description">
          Rage Quit LP Token Minted{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.RAGE_QUIT_LP_BURNED:
      return (
        <span className="description">
          Final ETH Claim{' '}
          {`${activity.blsPubKeyForKnot.slice(0, 6)}...${activity.blsPubKeyForKnot.slice(-6)}`}{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.LSD_NAME_UPDATED:
      return (
        <span className="description">
          LSD Network Name Updated{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.DAO_COMMISSION_UPDATED:
      return (
        <span className="description">
          LSD Network Commission Updated{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.SWEEP_REPORTED:
      return (
        <span className="description">
          Sweep Reported{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.FINAL_SWEEP_REPORTED:
      return (
        <span className="description">
          Final Sweep Reported{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.NODE_OPERATOR_CLAIMED_UNSTAKED_ETH:
      return (
        <span className="description">
          Node Operator Claimed Unstaked ETH{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.GIANT_SAVETH_CLAIMED_ETH_FROM_RAGEQUIT:
      return (
        <span className="description">
          Claimed ragequit ETH from Giant SavETH Pool{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    case ACTIVITY_TYPE.GIANT_MEV_CLAIMED_ETH_FROM_RAGEQUIT:
      return (
        <span className="description">
          Claimed ragequit ETH from Giant Fees and MEV Pool{' '}
          <a
            href={makeEtherscanLink(activity.tx)}
            target="_blank"
            rel="noreferrer"
            className={'text-primary'}>
            (check TX here)
          </a>
        </span>
      )
    default:
      return <></>
  }
}

export default Description
