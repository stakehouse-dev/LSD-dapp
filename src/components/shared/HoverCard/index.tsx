import { FC, ReactNode, useState } from 'react'

import Question_Mark from '@/assets/images/icon-questionmark.svg'

import { InformationCard } from '../'
import styles from './HoverCard.module.scss'

interface HoverCardProps {
  text: string
  children?: ReactNode
}

export const HoverCard: FC<HoverCardProps> = ({ text, children }) => {
  const [display, setDisplay] = useState(false)

  const showInfoCard = (e: any) => {
    e.preventDefault()
    setDisplay(true)
  }

  const hideInfoCard = (e: any) => {
    e.preventDefault()
    setDisplay(false)
  }

  return (
    <div
      className={styles.questionMarkWrapper}
      onMouseEnter={showInfoCard}
      onMouseLeave={hideInfoCard}>
      <div className={styles.imageWrapper}>
        <img src={Question_Mark} alt="Search" width={18} height={18} />
      </div>
      <div className={styles.contentWrapper}>
        {display && (
          <div className={styles.informationCardWrapper}>
            <InformationCard text={text}>{children}</InformationCard>
          </div>
        )}
      </div>
    </div>
  )
}
