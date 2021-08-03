import { useActiveWeb3React } from '../../hooks'
import { useGetLPTokenPrices, useGetTokenPrices } from '../../state/price/hooks'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { StakingRewards } from '../../components/ABI'
import positionInformation from './positionInformation'
import { calculateGasMargin, getContract } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import ReactGA from 'react-ga'
import hexStringToNumber from '../../utils/hexStringToNumber'
import { AutoColumn } from '../Column'
import { displayNumber, numberToPercent, numberToSignificant, numberToUsd } from '../../utils/numberUtils'
import { Dots } from '../swap/styleds'
import { RowBetween, RowFixed } from '../Row'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Text } from 'rebass'
import { ChevronDown, ChevronUp } from 'react-feather'
import { ButtonLight, ButtonSecondary } from '../Button'
import { Link } from 'react-router-dom'
import { currencyId } from '../../utils/currencyId'
import Countdown from '../Countdown'
import { ExternalButton, FixedHeightRow } from './index'
import styled, { ThemeContext } from 'styled-components'
import Card, { LightCard } from '../Card'
import { UniswapSVG, VRNSVG, MPHSVG, SushiSwapSVG } from '../SVG'
import { TYPE } from '../../theme'
import { getNetworkLibrary } from '../../connectors'
import { useTokenBalance } from '../../state/wallet/hooks'

const StakingCard = styled(Card)<{ highlight?: boolean; show?: boolean }>`
  font-size: 14px;
  line-height: 18px;
  background: ${({ theme }) => theme.appBoxBG};
  border: 1px solid ${({ theme, highlight }) => (highlight ? theme.textHighlight : theme.appBoxBG)};
  :hover {
    border: 1px solid
      ${({ theme, highlight, show }) => (highlight ? theme.textHighlight : show ? theme.appBoxBG : theme.textTertiary)};
  }
  position: relative;
`

const PlatformIcon = styled.div`
  position: absolute;
  opacity: 0.1;
  height: 40px;
  width: 40px;
  left: 230px;
  top: 12px;

  & svg {
    height: 40px;
    width: 40px;
    fill: ${({ theme }) => theme.textPrimary};
  }
`

export default function FullStakingCard({
  values,
  show,
  showOwn,
  showExpired,
  index
}: {
  values: any
  show?: boolean | false
  showOwn?: boolean | false
  showExpired?: boolean | true
  index: number
}) {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const { tokenPrices } = useGetTokenPrices()
  const { lpTokenPrices } = useGetLPTokenPrices()
  const [showMore, setShowMore] = useState(show)
  const { t } = useTranslation()
  const currency0 = unwrappedToken(values.tokens[0])
  const currency1 = unwrappedToken(values.tokens[1])
  const toggleWalletModal = useWalletModalToggle()
  const headerRowStyles = show ? 'default' : 'pointer'
  const addTransaction = useTransactionAdder()
  const fakeAccount = '0x0000000000000000000000000000000000000000'
  const fakeChainId = '1'
  const fakeLibrary = getNetworkLibrary()
  const [lifeLine, setLifeLine] = useState(false)
  const balance = useTokenBalance(account ?? undefined, values.liquidityToken)
  let currencyA = currency0
  let currencyB = currency1
  const [information, setInformation] = useState<any>({
    poolReserves: [0, 0],
    poolTokenPrices: [0, 0],
    userBalanceRaw: '0x00',
    userBalance: 0,
    userRewards: ['', ''],
    periodFinish: 0,
    rewardTokens: ['', ''],
    rewardTokenRates: ['0', '0'],
    totalSupply: 0,
    totalLPSupply: 0,
    poolType: values.type,
    apy: 0,
    notStarted: false,
    userShare: 0,
    lpTokenPrice: 0,
    stakePoolTotalDeposited: 0,
    stakePoolTotalLiq: 0,
    userShareUsd: 0,
    isInactive: true,
    updated: false,
    abi: StakingRewards,
    rewardInfo: [
      {
        address: '',
        decimals: 18,
        symbol: '',
        rate: 0,
        price: 0,
        userReward: 0
      },
      {
        address: '',
        decimals: 18,
        symbol: '',
        rate: 0,
        price: 0,
        userReward: 0
      }
    ]
  })
  const [fetching, setFetching] = useState(false)

  if (!fetching) {
    if (!!tokenPrices && !!lpTokenPrices) {
      setFetching(true)
      if (!information.updated) {
        if (!account) {
          positionInformation(values, fakeAccount, fakeChainId, fakeLibrary, tokenPrices, information).then(result => {
            setInformation(result)
          })
        } else {
          positionInformation(values, account, chainId, library, tokenPrices, information).then(result => {
            setInformation(result)
          })
        }
      }
    }
  }

  async function claimRewards(rewardsContractAddress: string) {
    if (!chainId || !library || !account || !information.updated) return
    const isDefault = information.poolType !== 'syflPool'
    const router = getContract(rewardsContractAddress, information.abi, library, account)
    const estimate = isDefault ? router.estimateGas.claimRewards : router.estimateGas.getReward
    const method: () => Promise<TransactionResponse> = isDefault ? router.claimRewards : router.getReward

    const value: BigNumber | null = null
    await estimate(value ? { value } : {})
      .then(() =>
        method().then(response => {
          addTransaction(response, {
            summary: t('claimRewardsOnPool', {
              currencyASymbol: currency0?.symbol,
              currencyBSymbol: currency1?.symbol
            })
          })

          ReactGA.event({
            category: 'Staking',
            action: 'ClaimRewards',
            label: currency0?.symbol + ' | ' + currency1?.symbol
          })
        })
      )
      .catch(error => {
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  async function unstakeAndClaimRewards(rewardsContractAddress: string) {
    if (!chainId || !library || !account || !information.updated) return
    const isDefault = information.poolType !== 'syflPool'
    const router = getContract(rewardsContractAddress, information.abi, library, account)
    const estimate = isDefault ? router.estimateGas.unstakeAndClaimRewards : router.estimateGas.exit
    const method: (...args: any) => Promise<TransactionResponse> = isDefault
      ? router.unstakeAndClaimRewards
      : router.exit
    const args: Array<string> = isDefault ? [information.userBalanceRaw] : []

    const value: BigNumber | null = null
    await estimate(...args, value ? { value } : {})
      .then(estimatedGasLimit =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit)
        }).then(response => {
          addTransaction(response, {
            summary: t('unstakeAndClaimRewardsOnPool', {
              currencyASymbol: currency0?.symbol,
              currencyBSymbol: currency1?.symbol
            })
          })

          ReactGA.event({
            category: 'Staking',
            action: 'UnstkeAndClaimRewards',
            label: currency0?.symbol + ' | ' + currency1?.symbol
          })
        })
      )
      .catch(error => {
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  switch (currency1?.symbol) {
    case 'LINK':
      currencyA = currency1
      currencyB = currency0
      break

    case 'ETH':
      if (currencyA?.symbol !== 'LINK') {
        currencyA = currency1
        currencyB = currency0
      }
      break

    case 'YFLUSD':
      if (currencyA?.symbol !== 'LINK' && currencyA?.symbol !== 'ETH') {
        currencyA = currency1
        currencyB = currency0
      }
      break
  }

  if (tokenPrices && information.apy === 0) {
    const token0id = values.tokens[0].address.toLowerCase()
    const token1id = values.tokens[1].address.toLowerCase()
    if (tokenPrices[token0id]) {
      information.poolTokenPrices[0] = Number(tokenPrices[token0id].price)
    }
    if (tokenPrices[token1id]) {
      information.poolTokenPrices[1] = Number(tokenPrices[token1id].price)
    }
  }

  if (information.updated && information.apy === 0) {
    if (information.rewardTokens[0] !== '' && information.rewardTokens[1] !== '' && tokenPrices) {
      const token0Address = information.rewardTokens[0].toLowerCase()
      const token1Address = information.rewardTokens[1].toLowerCase()

      if (tokenPrices[token0Address]) {
        information.rewardInfo[0].address = token0Address
        information.rewardInfo[0].decimals = tokenPrices[token0Address].decimals
        information.rewardInfo[0].symbol = tokenPrices[token0Address].symbol
        information.rewardInfo[0].price = tokenPrices[token0Address].price
      } else {
        if (token0Address !== fakeAccount) {
          if (values.tokens[0].address.toLowerCase() === token0Address && information.poolTokenPrices[0] !== 0) {
            information.rewardInfo[0].address = values.tokens[0].address
            information.rewardInfo[0].decimals = values.tokens[0].decimals
            information.rewardInfo[0].symbol = values.tokens[0].symbol
            information.rewardInfo[0].price = information.poolTokenPrices[0]
          }
          if (values.tokens[1].address.toLowerCase() === token0Address && information.poolTokenPrices[1] !== 0) {
            information.rewardInfo[0].address = values.tokens[1].address
            information.rewardInfo[0].decimals = values.tokens[1].decimals
            information.rewardInfo[0].symbol = values.tokens[1].symbol
            information.rewardInfo[0].price = information.poolTokenPrices[1]
          }
        }
      }

      if (information.rewardTokenRates[0] && information.rewardInfo[0].decimals) {
        information.rewardInfo[0].rate = hexStringToNumber(
          information.rewardTokenRates[0],
          information.rewardInfo[0].decimals,
          2,
          true
        )
      }

      if (tokenPrices[token1Address]) {
        information.rewardInfo[1].address = token1Address
        information.rewardInfo[1].decimals = tokenPrices[token1Address].decimals
        information.rewardInfo[1].symbol = tokenPrices[token1Address].symbol
        information.rewardInfo[1].price = tokenPrices[token1Address].price
      } else {
        if (token1Address !== fakeAccount) {
          if (values.tokens[0].address.toLowerCase() === token1Address && information.poolTokenPrices[0] !== 0) {
            information.rewardInfo[1].address = values.tokens[0].address
            information.rewardInfo[1].decimals = values.tokens[0].decimals
            information.rewardInfo[1].symbol = values.tokens[0].symbol
            information.rewardInfo[1].price = information.poolTokenPrices[0]
          }
          if (values.tokens[1].address.toLowerCase() === token1Address && information.poolTokenPrices[1] !== 0) {
            information.rewardInfo[1].address = values.tokens[1].address
            information.rewardInfo[1].decimals = values.tokens[1].decimals
            information.rewardInfo[1].symbol = values.tokens[1].symbol
            information.rewardInfo[1].price = information.poolTokenPrices[1]
          }
        }
      }

      if (information.rewardTokenRates[1] && information.rewardInfo[1].decimals) {
        information.rewardInfo[1].rate = hexStringToNumber(
          information.rewardTokenRates[1],
          information.rewardInfo[1].decimals,
          2,
          true
        )
      }
    }

    if (information.poolType === 'uni' || information.poolType === 'sushi') {
      information.stakePoolTotalLiq =
        information.poolReserves[0] * information.poolTokenPrices[0] +
        information.poolReserves[1] * information.poolTokenPrices[1]
    } else {
      if (lpTokenPrices) {
        if (lpTokenPrices[values.liquidityToken.address.toLowerCase()]) {
          information.stakePoolTotalLiq = lpTokenPrices[values.liquidityToken.address.toLowerCase()].totalLiq
        }
      }
    }

    information.lpTokenPrice =
      information.stakePoolTotalLiq && information.totalLPSupply > 0
        ? information.stakePoolTotalLiq / information.totalLPSupply
        : 0

    information.stakePoolTotalDeposited = information.lpTokenPrice
      ? information.totalSupply * information.lpTokenPrice
      : 0

    if (tokenPrices && information.stakePoolTotalDeposited) {
      let totalDailyRewardValue = 0
      if (information.rewardInfo[0].rate > 0) {
        const dailyToken0Value = information.rewardInfo[0].rate * information.rewardInfo[0].price
        if (dailyToken0Value > 0) {
          totalDailyRewardValue += dailyToken0Value
        }
      }

      if (information.rewardInfo[1].rate > 0) {
        const dailyToken1Value = information.rewardInfo[1].rate * information.rewardInfo[1].price
        if (dailyToken1Value > 0) {
          totalDailyRewardValue += dailyToken1Value
        }
      }

      if (!!information.totalSupply) {
        const yearlyRewardsValue = totalDailyRewardValue * 365
        const perDepositedDollarYearlyReward = yearlyRewardsValue / information.stakePoolTotalDeposited
        information.apy = perDepositedDollarYearlyReward * 100
      }
    }
  }
  if (information.userRewards[0] !== '') {
    information.rewardInfo[0].userReward = hexStringToNumber(
      information.userRewards[0],
      information.rewardInfo[0].decimals
    )
  }
  if (information.userRewards[1] !== '') {
    information.rewardInfo[1].userReward = hexStringToNumber(
      information.userRewards[1],
      information.rewardInfo[1].decimals
    )
  }

  if (information.userBalance > 0 && information.userShareUsd === 0) {
    information.userShare =
      information.totalSupply > 0 && information.userBalance > 0
        ? information.userBalance / (information.totalSupply / 100)
        : 0

    information.userShareUsd =
      information.lpTokenPrice && information.userBalance ? information.userBalance * information.lpTokenPrice : 0
  }

  if (!lifeLine) {
    if (
      (information.userBalance === 0 && showOwn) ||
      (information.isInactive && !showExpired) ||
      (!information.isInactive && showExpired)
    ) {
      setTimeout(() => setLifeLine(true), 2000)
    }
  }

  if (!lifeLine && !account && information.updated) {
    setTimeout(() => setLifeLine(true), 4000)
  }

  if (
    (information.userBalance === 0 && showOwn) ||
    (information.isInactive && !showExpired) ||
    (!information.isInactive && showExpired)
  ) {
    return (
      <>
        {index === 0 && !information.updated && !showOwn && (
          <LightCard padding="40px">
            <TYPE.body color={theme.textPrimary} textAlign="center">
              <Dots>{t('loading')}</Dots>
            </TYPE.body>
          </LightCard>
        )}
        {index === 0 && information.updated && show && !showOwn && (
          <LightCard padding="40px">
            <TYPE.body color={theme.textPrimary} textAlign="center">
              <Text fontSize="16px">{t('poolExpired')}</Text>
            </TYPE.body>
          </LightCard>
        )}
      </>
    )
  } else {
    return (
      <StakingCard highlight={information.userBalance > 0} show={show}>
        {information.poolType === 'uni' ? (
          <PlatformIcon>
            <UniswapSVG />
          </PlatformIcon>
        ) : information.poolType === 'mph' ? (
          <PlatformIcon>
            <MPHSVG />
          </PlatformIcon>
        ) : information.poolType === 'sushi' ? (
          <PlatformIcon>
            <SushiSwapSVG />
          </PlatformIcon>
        ) : (
          <PlatformIcon>
            <VRNSVG />
          </PlatformIcon>
        )}
        <AutoColumn gap="12px">
          <FixedHeightRow
            onClick={() => {
              if (!show) {
                setShowMore(!showMore)
              }
            }}
            style={{ cursor: headerRowStyles, position: 'relative' }}
          >
            {!information.isInactive && information.updated && (
              <div style={{ position: 'absolute', right: '-13px', top: '-16px', fontSize: '12px' }}>
                {information.apy > 0 ? (
                  <p style={{ margin: 0 }}>{t('apy', { apy: numberToPercent(information.apy) })}</p>
                ) : (
                  <>{!information.notStarted && <Dots>{t('loading')}</Dots>}</>
                )}
              </div>
            )}
            <RowFixed>
              <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} size={22} />
              {!information.updated ? (
                <Text fontWeight={500} fontSize={16}>
                  <Dots>{t('loading')}</Dots>
                </Text>
              ) : (
                <div style={{ display: 'flex', position: 'relative' }}>
                  <p style={{ fontWeight: 500, fontSize: 18, margin: '0 4px' }}>{currencyA.symbol}</p>
                  <p style={{ fontWeight: 100, fontSize: 18, margin: '0 4px' }}> | </p>
                  <p style={{ fontWeight: 500, fontSize: 18, margin: '0 4px' }}>{currencyB.symbol}</p>
                </div>
              )}
            </RowFixed>
            {!show && (
              <RowFixed>
                {showMore ? (
                  <ChevronUp size="20" style={{ marginInlineStart: '10px' }} />
                ) : (
                  <ChevronDown size="20" style={{ marginInlineStart: '10px' }} />
                )}
              </RowFixed>
            )}
          </FixedHeightRow>
          {showMore && (
            <AutoColumn gap="8px">
              {Number(balance?.toSignificant(1)) > 0 && (
                <RowBetween>
                  <Text>{t('stakableTokenAmount')}</Text>
                  {displayNumber(balance?.toSignificant(6))}
                </RowBetween>
              )}
              {information.userBalance > 0 && (
                <RowBetween>
                  <Text>{t('stakedTokenAmount')}</Text>
                  {numberToSignificant(information.userBalance)}
                </RowBetween>
              )}
              {information.userShareUsd > 0 && (
                <RowBetween>
                  <Text>{t('yourPoolShare')}</Text>
                  {numberToUsd(information.userShareUsd)} ({numberToPercent(information.userShare)})
                </RowBetween>
              )}
              {information.rewardInfo[0].userReward > 0 || information.rewardInfo[1].userReward > 0 ? (
                <RowBetween style={{ alignItems: 'flex-start' }}>
                  <Text>{t('claimableRewards')}</Text>
                  <Text style={{ textAlign: 'end' }}>
                    {information.rewardInfo[0].userReward > 0 && (
                      <div>
                        {numberToSignificant(information.rewardInfo[0].userReward)} {information.rewardInfo[0].symbol}
                      </div>
                    )}
                    {information.rewardInfo[1].userReward > 0 && (
                      <div>
                        {numberToSignificant(information.rewardInfo[1].userReward)} {information.rewardInfo[1].symbol}
                      </div>
                    )}
                  </Text>
                </RowBetween>
              ) : (
                <>
                  {information.userBalance > 0 && (
                    <RowBetween style={{ alignItems: 'flex-start' }}>
                      <Text>{t('claimableRewards')}</Text>
                      <Dots>{t('loading')}</Dots>
                    </RowBetween>
                  )}
                </>
              )}
              {Number(balance?.toSignificant(1)) > 0 && !show && !information.isInactive && (
                <RowBetween marginTop="10px">
                  <>
                    {information.poolType === 'uni' ? (
                      <ButtonSecondary
                        as={Link}
                        width="100%"
                        to={`/stake/UNI/${values.tokens[0].symbol}${values.tokens[1].symbol}`}
                      >
                        {t('stake')}
                      </ButtonSecondary>
                    ) : information.poolType === 'sushi' ? (
                      <ButtonSecondary
                        as={Link}
                        width="100%"
                        to={`/stake/SUSHI/${values.tokens[0].symbol}${values.tokens[1].symbol}`}
                      >
                        {t('stake')}
                      </ButtonSecondary>
                    ) : (
                      <ButtonSecondary
                        as={Link}
                        width="100%"
                        to={`/stake/${currencyId(currency0)}/${currencyId(currency1)}`}
                      >
                        {t('stake')}
                      </ButtonSecondary>
                    )}
                  </>
                </RowBetween>
              )}
              <RowBetween>
                <Text style={{ margin: '12px 0 0' }} fontSize="16px" fontWeight={600}>
                  {t('stakePoolStats')}
                </Text>
              </RowBetween>
              {information.stakePoolTotalLiq > 0 && (
                <RowBetween style={{ alignItems: 'flex-start' }}>
                  <Text>{t('stakePoolTotalLiq')}</Text>
                  <Text>{numberToUsd(information.stakePoolTotalLiq)}</Text>
                </RowBetween>
              )}
              {information.stakePoolTotalDeposited > 0 && (
                <RowBetween style={{ alignItems: 'flex-start' }}>
                  <Text>{t('stakePoolTotalDeposited')}</Text>
                  <Text>{numberToUsd(information.stakePoolTotalDeposited)}</Text>
                </RowBetween>
              )}
              {!information.notStarted && information.rewardInfo.length > 0 && !information.isInactive && (
                <RowBetween style={{ alignItems: 'flex-start' }}>
                  <Text>{t('stakePoolRewards')}</Text>
                  <Text style={{ textAlign: 'end' }}>
                    {information.rewardInfo[0]['rate'] > 0 && (
                      <div>
                        {t('stakeRewardPerDay', {
                          rate: displayNumber(information.rewardInfo[0].rate),
                          currencySymbol: information.rewardInfo[0].symbol
                        })}
                      </div>
                    )}
                    {information.rewardInfo.length > 1 && information.rewardInfo[1]['rate'] > 0 && (
                      <div style={{ textAlign: 'end' }}>
                        {t('stakeRewardPerDay', {
                          rate: displayNumber(information.rewardInfo[1].rate),
                          currencySymbol: information.rewardInfo[1].symbol
                        })}
                      </div>
                    )}
                    {information.apy > 0 && !information.isInactive && (
                      <div style={{ textAlign: 'end', marginTop: '8px' }}>
                        {t('apy', { apy: numberToPercent(information.apy) })}
                      </div>
                    )}
                  </Text>
                </RowBetween>
              )}
              <RowBetween>
                {information.notStarted ? (
                  <Text>{t('notStarted')}</Text>
                ) : (
                  <>
                    <Text>{t('timeRemaining')}</Text>
                    <Countdown ends={information.periodFinish} format="DD[d] HH[h] mm[m] ss[s]" string="endsIn" />
                  </>
                )}
              </RowBetween>
              <RowBetween marginTop="10px">
                {!show && (information.rewardInfo[0].userReward > 0 || information.rewardInfo[1].userReward > 0) && (
                  <ButtonSecondary
                    onClick={() => {
                      claimRewards(values.rewardsAddress)
                    }}
                    width="48%"
                    style={{ marginInlineEnd: '1%' }}
                  >
                    {t('claimRewards')}
                  </ButtonSecondary>
                )}
                {!show && information.userBalance > 0 && (
                  <>
                    {information.poolType === 'uni' ? (
                      <ButtonSecondary
                        as={Link}
                        width="48%"
                        to={`/unstake/UNI/${values.tokens[0].symbol}${values.tokens[1].symbol}`}
                      >
                        {t('unstake')}
                      </ButtonSecondary>
                    ) : information.poolType === 'sushi' ? (
                      <ButtonSecondary
                        as={Link}
                        width="48%"
                        to={`/unstake/SUSHI/${values.tokens[0].symbol}${values.tokens[1].symbol}`}
                      >
                        {t('unstake')}
                      </ButtonSecondary>
                    ) : (
                      <ButtonSecondary
                        as={Link}
                        width="48%"
                        style={{ marginInlineStart: '1%' }}
                        to={`/unstake/${currencyId(currency0)}/${currencyId(currency1)}`}
                      >
                        {t('unstake')}
                      </ButtonSecondary>
                    )}
                  </>
                )}
              </RowBetween>
              {!show && information.userBalance > 0 && (
                <RowBetween marginTop="10px">
                  <ButtonSecondary
                    onClick={() => {
                      unstakeAndClaimRewards(values.rewardsAddress)
                    }}
                    width="100%"
                    style={{ marginInlineEnd: '1%' }}
                  >
                    {t('unstakeAndClaim')}
                  </ButtonSecondary>
                </RowBetween>
              )}
              {!show && !information.isInactive && (
                <RowBetween marginTop="10px">
                  {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>{t('connectWallet')}</ButtonLight>
                  ) : (
                    <>
                      {information.poolType === 'uni' || information.poolType === 'sushi' ? (
                        <ExternalButton href={values.liquidityUrl}>{t('addLiquidity')}</ExternalButton>
                      ) : (
                        <ButtonSecondary
                          as={Link}
                          to={`/add/${currencyId(currencyA)}/${currencyId(currencyB)}`}
                          width="100%"
                        >
                          {t('addLiquidity')}
                        </ButtonSecondary>
                      )}
                    </>
                  )}
                </RowBetween>
              )}
            </AutoColumn>
          )}
        </AutoColumn>
      </StakingCard>
    )
  }
}
