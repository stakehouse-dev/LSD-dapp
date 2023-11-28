import { useQuery } from '@apollo/client'
import { FC, useMemo, useRef } from 'react'
import tw, { theme } from 'twin.macro'

import { ReactComponent as ArrowTopRightIcon } from '@/assets/images/icon-arrow-top-right.svg'
import { ClipboardCopy, HoverCard } from '@/components/shared'
import { NodeRunnerByValidatorQuery } from '@/graphql/queries/NodeRunnersQuery'
import { useLSDScore } from '@/hooks'
import useIsInViewport from '@/hooks/useIsInViewport'
import { humanReadableAddress, makeBeaconLink } from '@/utils/global'

import { HealthCircle } from '../ValidatorList/HealthFilter'
import styles from './KnootDetail.module.scss'

const KnootDetail: FC<{
  knot: any
  totaldETHEarnings: number | undefined
  currentAPR: number | undefined
}> = ({ knot, totaldETHEarnings }) => {
  const elementRef = useRef(null)
  const isInViewPort = useIsInViewport(elementRef)
  const { color: scoreColor } = useLSDScore(knot.id, isInViewPort)

  const { data: { lsdvalidator } = {} } = useQuery(NodeRunnerByValidatorQuery, {
    variables: { address: knot.id },
    fetchPolicy: 'network-only',
    skip: !knot.id
  })

  const delta = useMemo(() => {
    if (totaldETHEarnings && knot) {
      const ethTotaldETHEarnings = totaldETHEarnings
      const ethTotalDETHRewardsReceived = knot.totalDETHRewardsReceived / 1000000000

      const result =
        ((ethTotaldETHEarnings - ethTotalDETHRewardsReceived / 1000000000) / (24 * 1000000000)) *
        100
      return result.toLocaleString(undefined, { maximumFractionDigits: 3 })
    }

    return '0'
  }, [totaldETHEarnings, knot])

  const exchangeRate = useMemo(() => {
    if (totaldETHEarnings) {
      const result = (24 + totaldETHEarnings / 1000000000) / 24
      return result.toLocaleString(undefined, { maximumFractionDigits: 3 })
    }

    return '0'
  }, [totaldETHEarnings])

  return (
    <>
      <div className={styles.knootDetail}>
        <h1 className={styles.title}>Validator Details</h1>

        <div className={styles.row}>
          <div className={styles.property}>Stakehouse:</div>
          <div className={styles.value}>{knot.lsdIndexTicker}</div>
        </div>

        <div className={styles.row}>
          <div className={styles.property}>Validator Address:</div>
          <div className={styles.value}>{humanReadableAddress(knot.id || '')}</div>
          <ClipboardCopy copyText={knot.id} />
          <a
            className="flex items-center"
            href={makeBeaconLink(knot.id)}
            target="_blank"
            rel="noreferrer">
            <ArrowTopRightIcon />
          </a>
        </div>

        <div className={styles.row}>
          <div className={styles.property}>Exchange Rate:</div>
          <div className={styles.value}>{exchangeRate}</div>
          <div className={styles.hoverCardWrapper}>
            <HoverCard text="The sum of dETH earned plus the initial 24 dETH balance divided by the initial 24 dETH balance. The exchange rate should never go down." />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.property}>Current Delta:</div>
          <div
            className={styles.highlightValue}
            style={Number(delta) < 0 ? { color: '#FF7070' } : {}}>
            {delta}%
          </div>
          <div className={styles.hoverCardWrapper}>
            <HoverCard text="The current rate of yield of the validator compared with the yield from the last Balance Report. Positive numbers mean the validator is yielding at a higher rate than the last reported balance." />
          </div>
        </div>
        {scoreColor && (
          <div className={styles.row} ref={elementRef}>
            <div className={styles.property}>Validator Status:</div>
            <div className={`${styles.value} flex items-center gap-1`}>
              <HealthCircle color={scoreColor} />
            </div>
            <div className={styles.hoverCardWrapper}>
              <HoverCard text="">
                <ValidatorStatusTooltip />
              </HoverCard>
            </div>
          </div>
        )}
        {lsdvalidator && (
          <div className={styles.row}>
            <div className={styles.property}>Noderunner:</div>
            <div className={styles.highlightValue}>
              {lsdvalidator.smartWallet.nodeRunner.name
                ? lsdvalidator.smartWallet.nodeRunner.name
                : humanReadableAddress(lsdvalidator.smartWallet.nodeRunner.id)}
            </div>
            <ClipboardCopy copyText={knot.id} />
            <div className={styles.hoverCardWrapper}>
              <HoverCard text="Noderunner" />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const ValidatorStatusTooltip: FC = () => (
  <div>
    <HealthRow>
      <HealthCircle color={theme`colors.primary500`} />
      Green - Effective balance and active balance are {'>'} 32
    </HealthRow>
    <HealthRow>
      <HealthCircle color={theme`colors.yellow300`} />
      Yellow - Effective balance is {'>'} 32 and active balance is {'>'} 31.75
    </HealthRow>
    <HealthRow>
      <HealthCircle color={theme`colors.red200`} />
      Red - Effective balance is {'>'} 32
    </HealthRow>
  </div>
)

const HealthRow = tw.div`flex items-center gap-1 text-black text-xs font-medium`

export default KnootDetail
