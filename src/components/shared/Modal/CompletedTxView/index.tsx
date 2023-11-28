import { FC, ReactNode, useContext } from 'react'
import { Link } from 'react-router-dom'

import EthProfitIcon from '@/assets/images/profit.png'

import Button from '../../Buttons'
import { DefaultModalView, DefaultModalViewProps } from '../DefaultModalView'

export interface CompletedTxViewProps
  extends Omit<DefaultModalViewProps, 'children' | 'tooltip' | 'loading'> {
  txLink?: string
  txLinks?: any[]
  goToLink?: string
  goToContent?: ReactNode
  onGoToClick?: () => void
}

export const CompletedTxView: FC<CompletedTxViewProps> = ({
  txLink = '',
  txLinks,
  goToLink = '/',
  goToContent = 'My Profile',
  onGoToClick = () => {},
  icon,
  title = 'Transaction Confirmed',
  message = '',
  className = '',
  style = {}
}) => {
  return (
    <DefaultModalView
      icon={icon || <img src={EthProfitIcon} className="select-none" style={{ height: '64px' }} />}
      title={title ? <span className="text-primary">{title}</span> : title}
      message={message}
      className={className}
      style={style}>
      <>
        {txLinks && txLinks.length > 0 && (
          <div className="mb-4">
            {txLinks.map((tx, index) => (
              <a
                href={tx.href}
                key={index}
                className="w-full block text-grey300 text-sm hover:text-primary"
                target="_blank"
                rel="noreferrer">
                Etherscan - {tx.name}
              </a>
            ))}
          </div>
        )}
      </>
      <div className="flex gap-3" style={{ minWidth: '300px' }}>
        {txLink && (
          <a href={txLink} className="w-full" target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              Etherscan
            </Button>
          </a>
        )}

        {onGoToClick && (
          <Button className="w-full" onClick={onGoToClick}>
            {goToContent}
          </Button>
        )}
      </div>
    </DefaultModalView>
  )
}
