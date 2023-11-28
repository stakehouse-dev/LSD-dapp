import { FC, useMemo } from 'react'
import tw, { styled, theme } from 'twin.macro'

import dEth from '@/assets/images/icon-deth.svg'
import savEth from '@/assets/images/icon-saveth.svg'
import { HoverCard, Spinner } from '@/components/shared'
import { useMyAssetData, usePortfolioProtectedBatch } from '@/hooks'

export const ChartInfo: FC = () => {
  const { dETH, savETH, loading } = useMyAssetData()
  const { totaldETHEarned, slippage, numberOfKnots, nav, validator_earnings } =
    usePortfolioProtectedBatch()

  const sumOfValidatorEarnings = useMemo(
    () =>
      Object.keys(validator_earnings).reduce(
        (sum, current) => sum + validator_earnings[current],
        0
      ),
    [validator_earnings]
  )

  const fraction = 24 * sumOfValidatorEarnings

  return (
    <>
      {loading && (
        <div className="flex w-1/3 items-center justify-center">
          <Spinner size={32} />
        </div>
      )}
      {!loading && (
        <Wrapper>
          <Card>
            <div className="mb-3">Total Rewards Earned</div>
            <div className="text-primary500 text-4xl font-bold">
              {totaldETHEarned > 0.001
                ? totaldETHEarned.toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })
                : totaldETHEarned == 0
                ? 0
                : '< 0.001'}
              <span className="text-xl ml-1">dETH</span>
            </div>
          </Card>
          <Card className="bg-opacity-50 font-medium">
            <div className="mb-3">Index Assets</div>
            <div className="flex flex-col text-white pl-2">
              <AssetRow>
                <Label>
                  <img src={dEth} alt="copy icon" width={16} height={16} /> total dETH
                </Label>
                <span>
                  {Number(dETH).toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })}
                </span>
              </AssetRow>
              <AssetRow>
                <Label>
                  <img src={savEth} alt="copy icon" width={16} height={16} />
                  total savETH
                </Label>
                <span>
                  {Number(savETH).toLocaleString(undefined, {
                    maximumFractionDigits: 3
                  })}
                </span>
              </AssetRow>
            </div>
          </Card>
          <Card className="bg-opacity-50 font-medium">
            <div className="mb-2">Portfolio Exchange Rates</div>
            <div className="flex flex-col text-white gap-2 mb-4">
              <AssetRow>
                <Label className="items-start">
                  Contract:
                  <HoverCard text="The sum of dETH earned plus the initial 24 dETH balance divided by the initial 24 dETH balance. This is based on the last Balance Report." />
                </Label>
                {numberOfKnots > 0 ? (
                  <span>
                    {(Number(dETH) / fraction).toLocaleString(undefined, {
                      maximumFractionDigits: 3
                    })}
                  </span>
                ) : (
                  <span>-</span>
                )}
              </AssetRow>
              <AssetRow>
                <Label className="items-start">
                  Live:{' '}
                  <HoverCard text="The sum of dETH earned plus the initial 24 dETH balance divided by the initial 24 dETH balance. This is in reference to the consensus layer APR." />
                </Label>
                {numberOfKnots > 0 ? (
                  <span>
                    {Number((fraction + totaldETHEarned) / fraction).toLocaleString(undefined, {
                      maximumFractionDigits: 3
                    })}
                  </span>
                ) : (
                  <span>-</span>
                )}
              </AssetRow>
            </div>
            <div className="mb-2">Portfolio Details</div>
            <div className="flex flex-col text-white gap-2">
              <AssetRow>
                <Label className="items-start">
                  Total Number of KNOTs{' '}
                  <HoverCard text="The number of validators your portfolio encompasses." />
                </Label>
                <span>{numberOfKnots}</span>
              </AssetRow>

              <AssetRow>
                <Label className="items-start">
                  Reward %: <HoverCard text="Reward %" />
                </Label>
                <span>
                  {Number(slippage).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                </span>
              </AssetRow>
              <AssetRow>
                <Label className="items-start">
                  Portfolio Payoff Rate:{' '}
                  <HoverCard text="Average of the payoff rate of each validator considering their Slot tokens, slashings and top ups." />
                </Label>
                <span>
                  {Number(nav * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} %
                </span>
              </AssetRow>
            </div>
          </Card>
        </Wrapper>
      )}
    </>
  )
}

const AssetRow = tw.div`flex justify-between items-start`
const Card = tw.div`bg-[#2D2F35] py-4 px-8 rounded-2xl`
const Label = tw.div`flex items-center gap-1`

const Wrapper = tw.div`flex flex-col mr-8 max-w-[320px] w-full gap-4`
const Rate = styled.span<{ color: string }>`
  color: ${(props) => (props.color == 'green' ? theme`colors.primary500` : props.color)};
`
