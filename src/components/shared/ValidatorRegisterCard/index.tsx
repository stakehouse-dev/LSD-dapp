import classNames from 'classnames'
import { FC, PropsWithChildren, ReactNode } from 'react'

import { ReactComponent as CheckIcon } from '@/assets/images/icon-check-grey.svg'
import { Tooltip } from '@/components/shared'

import styles from './styles.module.scss'

interface IProps {
  title: string
  stepNum: number
  active: boolean
  done: boolean
  open?: boolean
  onClickHeader?: () => void
  inside?: boolean
  tooltip?: ReactNode
  showGuide?: boolean
}

const cx = classNames.bind(styles)
export const ValidatorRegisterCard: FC<PropsWithChildren<IProps>> = ({
  title,
  stepNum,
  active,
  done,
  open = false,
  onClickHeader,
  inside,
  tooltip,
  showGuide,
  children
}) => {
  return (
    <div className={cx(styles.registerCard, { [styles.registerCardActive]: active })}>
      {showGuide && (
        <p className={styles.keyGenerationGuide}>
          Follow the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.joinstakehouse.com/en/articles/6597493-how-do-i-generate-my-validator-keys-using-wagyu-keygen-mainnet-testnet">
            Key Generation
          </a>{' '}
          guide.
        </p>
      )}
      <div className={styles.registerCardContent} onClick={onClickHeader}>
        <div className={styles.registerCardInfo}>
          <div className={styles.registerCardStepNum}>{stepNum.toString()}</div>
          <div className={styles.registerCardTitle}>{title}</div>

          {tooltip && <Tooltip message={tooltip} />}
        </div>
        {active
          ? inside && <div>{children}</div>
          : done && (
              <div className={styles.registerCardCheck}>
                Done
                <CheckIcon />
              </div>
            )}
      </div>
      {(active || open) && !inside && children}
    </div>
  )
}
