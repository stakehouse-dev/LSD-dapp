import { FC, ReactNode } from 'react'
import tw, { styled } from 'twin.macro'

import styles from './InformationCard.module.scss'

interface InformationCardProps {
  text: string
  children?: ReactNode
}

export const InformationCard: FC<InformationCardProps> = ({ text, children }) => {
  return (
    <Wrapper className={styles.informationCard} text={text}>
      <p className={styles.text}>{text}</p>
      {children}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ text: string }>`
  ${(props) => (!props.text ? tw`w-max` : tw`w-56`)}
`
