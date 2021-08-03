import React, { useContext, useEffect, useState } from 'react'
import { Text } from 'rebass'
import Card, { BlueCard } from '../../components/Card'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import AppBody from '../AppBody'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
import Question from '../../components/QuestionHelper'
import { useNavigationActiveItemManager } from '../../state/navigation/hooks'
import { displayNumber, numberToPercent, numberToSignificant, numberToUsd } from '../../utils/numberUtils'
import { ButtonSecondary } from '../../components/Button'
import { Link } from 'react-router-dom'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { MARKETCAPS, SINGLE_POOLS, VRN, yVRN } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import Loader from '../../components/Loader'
import { getContract } from '../../utils'
import { governancePool } from '../../components/ABI'
import { ETH_API_KEYS, getNetworkLibrary, NETWORK_URL } from '../../connectors'
import hexStringToNumber from '../../utils/hexStringToNumber'
import { BigNumber } from 'ethers'
import { useBlockNumber, useWalletModalToggle } from '../../state/application/hooks'
import { useGetTokenPrices } from '../../state/price/hooks'
import moment from 'moment'
import Countdown from '../../components/Countdown'
import Web3 from 'web3'

const GovernanceBalance = styled.div`
  display: flex;
  flex: 0 0 100%;
  margin: 0 0 24px;
  font-size: 14px;

  div {
    align-items: flex-start;
  }

  p {
    line-height: 1.4;
  }
`

const UserBalance = styled.div`
  display: flex;
  flex: 0 0 100%;
  margin: 0 0 12px;
  font-size: 14px;

  div {
    align-items: flex-start;
  }

  p {
    line-height: 1.4;
  }
`

const Title = styled.p`
  font-size: 18px;
  margin: 0;
  font-weight: 700;
`

const BalanceText = styled.p`
  margin: 0;
  text-align: right;
`

const VotingButton = styled.a`
  padding: 18px;
  width: 100%;
  font-weight: 500;
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius};
  outline: none;
  border: 1px solid transparent;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  position: relative;
  background: ${({ theme }) => theme.buttonBG};
  color: ${({ theme }) => theme.buttonTextColor};
  font-size: 18px;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.buttonBGHover};
    background: ${({ theme }) => theme.buttonBGHover};
    color: ${({ theme }) => theme.buttonTextColorHover};
  }
  &:hover {
    background: ${({ theme }) => theme.buttonBGHover};
    color: ${({ theme }) => theme.buttonTextColorHover};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.buttonBGActive};
    background: ${({ theme }) => theme.buttonBGActive};
    color: ${({ theme }) => theme.buttonTextColorActive};
  }
  }
  `

async function getBlockCountDown(targetBlock: number) {
  const ethAPIKey = ETH_API_KEYS[Math.floor(Math.random() * ETH_API_KEYS.length)]
  try {
    const url = `https://api.etherscan.io/api?module=block&action=getblockcountdown&blockno=${targetBlock}&apikey=${ethAPIKey}`
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    if (response.ok) {
      const content = await response.json()
      if (content.status === '0') {
        return ['']
      } else {
        return content.result.EstimateTimeInSec
      }
    } else {
      return ['']
    }
  } catch (e) {
    console.log(e)
  }
}

async function getIncomingTransactions(senderAddress: string) {
  const ethAPIKey = ETH_API_KEYS[Math.floor(Math.random() * ETH_API_KEYS.length)]
  try {
    const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0x80Ad276cce240A8C4ad05c589557482fFD729755&address=${senderAddress}&startblock=0&endblock=999999999&sort=desc&apikey=${ethAPIKey}`
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    if (response.ok) {
      const content = await response.json()
      if (content.status === '0') {
        return []
      } else {
        return content.result
      }
    }
  } catch (e) {
    console.log(e)
  }
}

export default function StakeGovernance() {
  const { account } = useActiveWeb3React()
  const fakeAccount = '0x0000000000000000000000000000000000000000'
  const fakeLibrary = getNetworkLibrary()
  const governanceAddress = SINGLE_POOLS.GOV.rewardsAddress
  const theme = useContext(ThemeContext)
  const [govBalanceFetching, setGovBalanceFetching] = useState(false)
  const [yvrnPrice, setYVrnPrice] = useState(0)
  const [yvrnPriceLastMonth, setYVrnPriceLastMonth] = useState(0)
  const [apy, setApy] = useState(0)
  const [totalApy, setTotalApy] = useState(0)
  const [receivedVRNManual, setReceivedVRNManual] = useState(0)
  const [daysSinceLastDistribution, setDaysSinceLastDistribution] = useState(0)
  const toggleWalletModal = useWalletModalToggle()
  const { t } = useTranslation()
  const newActive = useNavigationActiveItemManager()
  const [userBalances, fetchingUserBalances] = useTokenBalancesWithLoadingIndicator(account ?? undefined, [VRN, yVRN])
  const [govBalances, fetchingGovBalances] = useTokenBalancesWithLoadingIndicator(governanceAddress ?? undefined, [VRN])
  const [feeCountdownFetched, setFeeCountdownFetched] = useState(false)
  const [feeCountdown, setFeeCountdown] = useState(0)
  const govContract = getContract(governanceAddress, governancePool, fakeLibrary, fakeAccount)
  const { tokenPrices } = useGetTokenPrices()
  const vrnPriceUsd = tokenPrices ? tokenPrices[VRN.address.toLowerCase()].price : 0
  const yvrnPriceUsd = tokenPrices && yvrnPrice !== 0 ? vrnPriceUsd * yvrnPrice : vrnPriceUsd
  const now = moment().unix()
  const lastBlockNumber = useBlockNumber()
  const numberOfDaysForApy = 60
  const lastMonthBlockNumber = lastBlockNumber ? lastBlockNumber - numberOfDaysForApy * 6408 : 0
  const startDate = moment('07-02-2021', 'MM-DD-YYYY')
  const daysSinceStart = moment().diff(startDate, 'days')
  const vrnStartPrice = 1
  const hasVrn = Number(userBalances[VRN.address]?.toSignificant(1)) > 0
  const hasYVrn = Number(userBalances[yVRN.address]?.toSignificant(1)) > 0
  const totalStaked = Number(govBalances[VRN.address]?.toSignificant(8))
  const percentageStakedTVL = totalStaked / (MARKETCAPS.VRN * 0.01)

  useEffect(() => {
    newActive('stake-governance')
  })

  if (!govBalanceFetching) {
    setGovBalanceFetching(true)

    if (account) {
      if (yvrnPrice === 0) {
        const getPricePerFullShareMethod: (...args: any) => Promise<BigNumber> = govContract.getPricePerFullShare
        getPricePerFullShareMethod()
          .then(response => {
            setYVrnPrice(hexStringToNumber(response.toHexString(), yVRN.decimals))
          })
          .catch(e => {
            setYVrnPrice(1)
            console.log(e)
          })
      }

      const earlyWithdrawalFeeExpiryMethod: (...args: any) => Promise<BigNumber> = govContract.earlyWithdrawalFeeExpiry
      const args: Array<string> = [account]
      earlyWithdrawalFeeExpiryMethod(...args).then(response => {
        getBlockCountDown(hexStringToNumber(response.toHexString(), 0)).then(countdown => {
          setFeeCountdown(now + Math.ceil(countdown))
          setFeeCountdownFetched(true)
        })
      })
    }

    if (receivedVRNManual === 0) {
      getIncomingTransactions('0x0389d755c1833c9b350d4e8b619eae16defc1cba').then(transactions => {
        let VRNManual = 0
        transactions.forEach(function(transaction: Record<string, any>) {
          if (transaction.to === governanceAddress.toLowerCase()) {
            VRNManual += Number(transaction.value)
            setDaysSinceLastDistribution(moment().diff(moment.unix(transaction.timeStamp), 'days'))
          }
        })
        setReceivedVRNManual(VRNManual)
      })
    }
  }

  if (lastMonthBlockNumber !== 0 && yvrnPriceLastMonth === 0) {
    const web3 = new Web3(new Web3.providers.HttpProvider(NETWORK_URL))
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const abstractContract = new web3.eth.Contract(governancePool, governanceAddress)
    abstractContract.methods
      .getPricePerFullShare()
      .call({}, lastMonthBlockNumber)
      .then((response: any) => {
        if (response === null) {
          setYVrnPriceLastMonth(1)
        } else {
          setYVrnPriceLastMonth(hexStringToNumber(response.toHexString(), yVRN.decimals))
        }
      })
      .catch((e: any) => {
        console.log(e)
      })
  }

  if (yvrnPrice > 0 && yvrnPriceLastMonth > 0 && apy === 0) {
    const priceDifference = yvrnPrice - yvrnPriceLastMonth
    const percentageDifference = (priceDifference / ((yvrnPriceLastMonth + yvrnPrice) / 2)) * 100
    const dailyPercentage = percentageDifference / numberOfDaysForApy
    setApy(dailyPercentage * 365 + 0.1)
  }

  if (yvrnPrice > 0 && totalApy === 0) {
    const totalPriceDifference = yvrnPrice - vrnStartPrice
    const totalPercentageDifference = (totalPriceDifference / ((vrnStartPrice + yvrnPrice) / 2)) * 100
    const dailyTotalPercentage = totalPercentageDifference / daysSinceStart
    setTotalApy(dailyTotalPercentage * 365 + 0.1)
  }

  const totalReceivedVRN = receivedVRNManual / 1000000000000000000

  return (
    <>
      <Card style={{ maxWidth: '420px', padding: '12px', backgroundColor: theme.navigationBG, marginBottom: '16px' }}>
        <SwapPoolTabs active={'stake'} />
      </Card>
      <AppBody>
        <AutoColumn gap={'12px'}>
          <RowBetween>
            <Title>{t('stakeGovernance')}</Title>
            <Question text={t('stakeGovernanceDescription')} />
          </RowBetween>
        </AutoColumn>
        <Text fontSize="12px" color={theme.textSecondary}>
          {t('stakeGovernanceLastDistribution', { days: daysSinceLastDistribution })}
        </Text>

        {apy > 0.1 && (
          <>
            <BlueCard style={{ margin: '24px 0 12px' }}>
              <Text textAlign="center" fontSize={12} fontWeight={400}>
                {t('currentEstimatedAPY')}
              </Text>
              <Text textAlign="center" fontSize={30} fontWeight={700}>
                {numberToPercent(apy)}
              </Text>
            </BlueCard>
            <Text fontSize="12px" color={theme.textSecondary}>
              {t('currentEstimatedAPYDisclaimer', { days: numberOfDaysForApy })}
            </Text>
          </>
        )}
        <GovernanceBalance>
          <AutoColumn gap={'12px'} style={{ width: '100%' }}>
            <RowBetween style={{ marginTop: '24px' }}>
              <Title>{t('stakeGovernanceStatistics')}</Title>
            </RowBetween>
            <RowBetween>
              <Text>{t('stakedCurrency', { currencySymbol: VRN.symbol })}:</Text>
              {fetchingGovBalances ? (
                <Loader />
              ) : (
                <BalanceText>
                  {displayNumber(totalStaked) + ' ' + VRN.symbol}
                  <br />
                  {numberToUsd(Number(govBalances[VRN.address]?.toSignificant(8)) * vrnPriceUsd)}
                  <br />
                  {t('stakeOfTotalSupply', { percent: numberToPercent(percentageStakedTVL) })}
                </BalanceText>
              )}
            </RowBetween>
            <RowBetween>
              <Text>{t('currencyPrice', { currencySymbol: yVRN.symbol })}:</Text>
              {yvrnPrice === 0 ? (
                <Loader />
              ) : (
                <BalanceText>{numberToSignificant(yvrnPrice, 6) + ' ' + VRN.symbol}</BalanceText>
              )}
            </RowBetween>
            {totalReceivedVRN > 1 && (
              <RowBetween style={{ margin: '12px 0 0', alignItems: 'flex-start', lineHeight: '1.4' }}>
                <Text> {t('stakeGovernanceTotalDistributed')}</Text>
                <BalanceText>
                  {`${numberToSignificant(totalReceivedVRN, 5)} ${VRN.symbol}`}
                  <br />({numberToUsd(totalReceivedVRN * vrnPriceUsd)})
                </BalanceText>
              </RowBetween>
            )}
            {totalApy > 0.1 && (
              <>
                <RowBetween>
                  <Text textAlign="center">{t('currentEstimatedTotalAPY')}</Text>
                  <BalanceText>{numberToPercent(totalApy)}</BalanceText>
                </RowBetween>
                <RowBetween>
                  <Text fontSize="12px" color={theme.textSecondary}>
                    {t('currentEstimatedTotalAPYDisclaimer', { days: daysSinceStart })}
                  </Text>
                </RowBetween>
              </>
            )}
          </AutoColumn>
        </GovernanceBalance>

        <UserBalance>
          <AutoColumn gap={'12px'} style={{ width: '100%' }}>
            <RowBetween style={{ marginTop: '24px' }}>
              <Title>{t('stakeGovernanceStake')}</Title>
              <Question text={t('stakeGovernanceStakeDescription')} />
            </RowBetween>
            {account && (
              <>
                <RowBetween>
                  <Text>{t('yourCurrencyBalance', { currencySymbol: VRN.symbol })}:</Text>
                  {fetchingUserBalances ? (
                    <Loader />
                  ) : (
                    <BalanceText>
                      {userBalances[VRN.address]?.toSignificant(4) + ' ' + VRN.symbol}
                      <br />({numberToUsd(Number(userBalances[VRN.address]?.toSignificant(8)) * vrnPriceUsd)})
                    </BalanceText>
                  )}
                </RowBetween>
                <RowBetween>
                  {hasVrn ? (
                    <ButtonSecondary as={Link} width="100%" to="/stake/single/gov">
                      {t('stake')}
                    </ButtonSecondary>
                  ) : (
                    <ButtonSecondary as={Link} width="100%" to={`/swap?outputCurrency=${VRN.address}`}>
                      {t('buyCurrency', { currency: VRN.symbol })}
                    </ButtonSecondary>
                  )}
                </RowBetween>
              </>
            )}
          </AutoColumn>
        </UserBalance>
        {account ? (
          <>
            {hasYVrn && (
              <UserBalance>
                <AutoColumn gap={'12px'} style={{ width: '100%' }}>
                  <RowBetween style={{ marginTop: '24px' }}>
                    <Title>{t('stakeGovernanceVoting')}</Title>
                    <Question text={t('stakeGovernanceVotingDescription')} />
                  </RowBetween>
                  <RowBetween>
                    <VotingButton href="https://snapshot.varen.finance">{t('stakeGovernanceVoting')}</VotingButton>
                  </RowBetween>
                </AutoColumn>
              </UserBalance>
            )}
            <UserBalance>
              <AutoColumn gap={'12px'} style={{ width: '100%' }}>
                <RowBetween style={{ marginTop: '24px' }}>
                  <Title>{t('stakeGovernanceUnstake')}</Title>
                  <Question text={t('stakeGovernanceUnstakeDescription')} />
                </RowBetween>
                <RowBetween>
                  <Text>{t('yourCurrencyBalance', { currencySymbol: yVRN.name })}:</Text>
                  {fetchingUserBalances ? (
                    <Loader />
                  ) : (
                    <BalanceText>
                      {numberToSignificant(Number(userBalances[yVRN.address]?.toSignificant(18)) * yvrnPrice, 4) +
                        ' ' +
                        VRN.symbol}
                      <br />
                      {userBalances[yVRN.address]?.toSignificant(4) + ' ' + yVRN.symbol}
                      <br />({numberToUsd(Number(userBalances[yVRN.address]?.toSignificant(8)) * yvrnPriceUsd)})
                    </BalanceText>
                  )}
                </RowBetween>
                {hasYVrn && (
                  <RowBetween>
                    <Text>{t('stakeGovernanceUnstakeFee')}:</Text>
                    {!feeCountdownFetched ? (
                      <Loader />
                    ) : feeCountdown > now ? (
                      <BalanceText>
                        0.5% <br />
                        <Countdown
                          ends={feeCountdown}
                          format="DD[d] HH[h] mm[m] ss[s]"
                          string="setToZeroPercentIn"
                          endedString="stakeGovernanceNoFee"
                        />
                      </BalanceText>
                    ) : (
                      <Text>0%</Text>
                    )}
                  </RowBetween>
                )}
                {hasYVrn && (
                  <RowBetween>
                    <ButtonSecondary as={Link} width="100%" to="/unstake/single/gov">
                      {t('unstake')}
                    </ButtonSecondary>
                  </RowBetween>
                )}
              </AutoColumn>
            </UserBalance>
          </>
        ) : (
          <ButtonSecondary onClick={toggleWalletModal}>{t('connectWallet')}</ButtonSecondary>
        )}
      </AppBody>
    </>
  )
}
