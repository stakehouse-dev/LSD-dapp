import './index.scss'

import { useQuery } from '@apollo/client'
import { BigNumber, ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as CloseIcon } from '@/assets/images/close-icon.svg'
import { ReactComponent as ArrowRightIcon } from '@/assets/images/icon-arrow-right-circle.svg'
import { ReactComponent as BalanceReportIcon } from '@/assets/images/icon-balance-report.svg'
import { ReactComponent as ArrowDownIcon } from '@/assets/images/icon-chevron-down.svg'
import { Tooltip } from '@/components/shared'
import { LSD_STATUS } from '@/constants/lsdStatus'
import { BlockswapSDKContext } from '@/context/BlockswapSDKContext'
import { getLSDValidatorStatus, LsdValidatorsQuery } from '@/graphql/queries/lsdValidators'
import { ICard, useCards, useDebounce } from '@/hooks'
import { ValidatorT } from '@/types'

const Utilities = () => {
  const [key, setKey] = useState<string>('')
  const blsKey = useDebounce(key)
  const navigate = useNavigate()
  const { sdk } = useContext(BlockswapSDKContext)

  const { data: validators } = useQuery(getLSDValidatorStatus, {
    variables: { blsKey },
    skip: !blsKey,
    fetchPolicy: 'network-only'
  })
  const validatorStatus = validators?.lsdvalidators[0] ? validators?.lsdvalidators[0].status : null

  // 0x8f2d747c66abca2880274d1d4950a1336088fe7ce8e8aa4b4b1195dc0589f5e3855fad474319dc243ad9d9a764b4999a

  const [open, setOpen] = useState<boolean>(false)
  const [openedPopup, setOpenedPopup] = useState<string>('')
  const [indexIdForKnot, setIndexIdForKnot] = useState<BigNumber>()

  const handleChange = async (value: string) => {
    setKey(value)
  }

  const handleCardClick = (item: ICard) => {
    if (item.appType === 'external') {
      window.open(`${item.externalLink}/validator/${key}`, '_blank')
    }
    if (item.appType === 'internalPage') {
      navigate(item.url || '')
    }
    if (item.appType === 'popUp') {
      setOpen(true)
      setOpenedPopup(item.title)
    }
  }

  const cards = useCards()

  useEffect(() => {
    const fetchIndexIdForKnot = async () => {
      if (sdk && key) {
        const index = await sdk.utils.associatedIndexIdForKnot(key)
        setIndexIdForKnot(index)
      }
    }

    fetchIndexIdForKnot()
  }, [sdk, key])

  const renderCards = (cards: ICard[]) => {
    const cardComponents = cards
      .map((item: ICard, index: number) => {
        let Popup
        if (item.appType == 'popUp') Popup = require(`./Modals/${item.component}`).default

        if (
          ['Balance Report', 'savETH Curation'].includes(item.title) &&
          validatorStatus &&
          validatorStatus !== LSD_STATUS.DERIVATIVES_MINTED
        ) {
          return null
        }

        if (
          item.title === 'Fren Delegation' &&
          validatorStatus &&
          validatorStatus !== LSD_STATUS.WAITING_FOR_ETH
        ) {
          return null
        }

        if (item.title === 'savETH Curation' && indexIdForKnot) {
          if (!indexIdForKnot.eq(ethers.BigNumber.from('0'))) {
            return null
          }
        }

        return (
          <div
            className="utility-card cursor-pointer"
            key={index}
            onClick={() => handleCardClick(item)}>
            <div>
              <BalanceReportIcon />
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <div className="flex gap-2">
                  {item.title} <Tooltip message={item.tooltip} />
                </div>
                <div className="text-grey700">{item.subtitle}</div>
              </div>
              <ArrowRightIcon />
            </div>
            {item.appType == 'popUp' && item.title === openedPopup && (
              <Popup validator={key} open={open} onClose={() => setOpen(false)} />
            )}
          </div>
        )
      })
      .filter((item) => item)
    if (cardComponents.length === 0) {
      return (
        <div className="py-6 px-4 text-center text-grey700">
          No available utilities for this validator. Please ensure it is staked through Stakehouse.
        </div>
      )
    } else {
      return <div className="py-6 px-4 grid grid-cols-3 gap-x-4 gap-y-2">{cardComponents}</div>
    }
  }
  return (
    <div className="max-w-2xl w-full flex flex-col items-center py-10 mx-auto">
      <div className="w-full text-center text-4xl font-semibold text-white mb-6">
        Utilities for ETH stake management
      </div>
      <div className="w-full py-8 px-20 gap-4 flex flex-col items-center bg-grey900 rounded-2xl">
        <div className="text-grey700">Enter your address and unlock powerful utilities</div>
        <div className="relative w-full">
          <input
            value={key}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter a validator public key"
            className="w-full text-grey25 bg-black outline-none py-3 pl-4 pr-10 rounded-lg border border-grey500"
          />
          {key.length > 0 && (
            <div className="cursor-pointer absolute right-3 top-3" onClick={() => handleChange('')}>
              <CloseIcon />
            </div>
          )}
        </div>
      </div>
      <div className="relative bg-grey850 rounded-2xl text-white mt-4 w-full">
        {key.length !== 98 && <div className="overlay w-full h-full absolute" />}
        {cards && renderCards(cards)}
      </div>
    </div>
  )
}

export default Utilities
