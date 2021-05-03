import React, { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import Card from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import { useActiveWeb3React } from '../../hooks'
import AppBody from '../AppBody'
import { useTranslation, Trans } from 'react-i18next'
import Row, { RowBetween } from '../../components/Row'
import { Link, Text } from 'rebass'
import Question from '../../components/QuestionHelper'
import { Form, Fields, required, isEmail } from '../../components/Form'
import { Field } from '../../components/Field'
import { ButtonLight, ButtonPrimary } from '../../components/Button'
import { Input as NumericalInput } from '../../components/NumericalInput'
import { TYPE } from '../../theme'
import { useWalletModalToggle } from '../../state/application/hooks'
import { WYRE_API_KEY, WYRE_ID, WYRE_URL } from '../../connectors'
import { useWyreObject } from '../../hooks/useWyreObject'
import { BuyFooter } from '../../components/Buy/footer'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ETHER } from '@uniswap/sdk'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import { useNavigationActiveItemManager } from '../../state/navigation/hooks'
import useParsedQueryString from '../../hooks/useParsedQueryString'

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  width: 100%;
  z-index: 1;
`
const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.textTertiary};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
  }
`

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: '0.75rem 0.5rem 0.75rem 1rem';
`
const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.appCurrencyInputBG};
  background: ${({ theme }) => theme.appCurrencyInputBG};
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 100%;
  margin: 0 0 12px;
`

const LimitHint = styled.div`
  width: 100%;
  padding: 0 0 12px;

  a {
    color: ${({ theme }) => theme.textHighlight};
    text-decoration: none;

    :hover,
    :focus {
      text-decoration: underline;
    }
  }
`
const CurrencySelectWrapper = styled.div`
  display: flex;
  align-items: space-between;
  width: 100%;
`

const CurrencySelect = styled.button<{ selected: boolean; primary?: boolean; left?: boolean; right?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: ${({ selected, primary, theme }) => {
    if (selected) {
      return theme.appCurrencyInputBGActive
    } else {
      if (primary) {
        return theme.appCurrencyInputBG
      } else {
        return theme.appCurrencyInputBGActive
      }
    }
  }};
  color: ${({ selected, theme }) =>
    selected ? theme.appCurrencyInputTextColorActive : theme.appCurrencyInputTextColor};
  border-radius: ${({ left, right, theme }) =>
    left
      ? `${theme.borderRadius} 0px 0px ${theme.borderRadius}`
      : right
      ? `0px ${theme.borderRadius} ${theme.borderRadius} 0px`
      : theme.borderRadius};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  [dir='rtl'] & {
    border-radius: ${({ left, right, theme }) =>
      left
        ? `0px ${theme.borderRadius} ${theme.borderRadius} 0px`
        : right
        ? `${theme.borderRadius} 0px 0px ${theme.borderRadius}`
        : theme.borderRadius};
  }
  :focus,
  :hover {
    background: ${({ selected, primary, theme }) => {
      if (selected) {
        return theme.appCurrencyInputBGActive
      } else {
        if (primary) {
          return theme.appCurrencyInputBGHover
        } else {
          return theme.appCurrencyInputBGActiveHover
        }
      }
    }};
  }
`

const StyledTokenName = styled.div`
  margin: 0 0.25rem 0 0.75rem;
  font-size: 20px;
`

export default function Buy() {
  const ETH = ETHER
  const LINK = new WrappedTokenInfo(
    {
      address: '0x514910771af9ca656af840dff83e8264ecf986ca',
      chainId: 1,
      name: 'ChainLink',
      symbol: 'LINK',
      decimals: 18,
      logoURI: 'https://logos.varen.finance/0x514910771af9ca656af840dff83e8264ecf986ca.png'
    },
    []
  )
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const [amount, setAmount] = useState('')
  const [currencyChanged, setCurrencyChanged] = useState(false)
  const [currency, setCurrency] = useState('Ethereum')
  const [currencySymbol, setCurrencySymbol] = useState('ETH')
  const ethDestination = account ? 'ethereum:' + account : ''
  const { t } = useTranslation()
  useWyreObject(amount, account, currencySymbol)
  const toggleWalletModal = useWalletModalToggle()
  const disableBuy = amount === '' || amount === '0.00'
  const showLimitHint = amount !== '' && amount !== '0.00' && Number(amount) > 500

  const fields: Fields = {
    firstName: {
      id: 'firstName',
      label: t('firstName'),
      style: { paddingInlineEnd: 6 },
      autocomplete: 'given-name',
      validation: { rule: required }
    },
    lastName: {
      id: 'lastName',
      label: t('lastName'),
      style: { paddingInlineStart: 6 },
      autocomplete: 'family-name',
      validation: { rule: required }
    },
    email: {
      id: 'email',
      label: t('email'),
      editor: 'email',
      autocomplete: 'email',
      validation: { rule: isEmail }
    },
    amount: {
      id: 'amount',
      editor: 'hidden'
    },
    sourceCurrency: {
      id: 'sourceCurrency',
      editor: 'hidden'
    },
    destCurrency: {
      id: 'destCurrency',
      editor: 'hidden'
    },
    dest: {
      id: 'dest',
      editor: 'hidden'
    },
    referrerAccountId: {
      id: 'referrerAccountId',
      editor: 'hidden'
    },
    hideTrackBtn: {
      id: 'hideTrackBtn',
      editor: 'hidden'
    },
    country: {
      id: 'country',
      editor: 'hidden'
    }
  }

  const parsedQs = useParsedQueryString()
  let newId = 'buy'
  const newActive = useNavigationActiveItemManager()
  if (!currencyChanged) {
    if (typeof parsedQs['currency'] !== 'undefined' && typeof parsedQs['currency'] === 'string') {
      if (parsedQs['currency'].toLowerCase() === 'link') {
        newId = 'buy-link'
        if (currency !== 'Chainlink') {
          setCurrency('Chainlink')
          setCurrencySymbol('LINK')
        }
      }
    } else {
      if (currency !== 'Ethereum') {
        setCurrency('Ethereum')
        setCurrencySymbol('ETH')
      }
    }
  }
  useEffect(() => {
    newActive(newId)
  })
  return (
    <>
      <Card style={{ maxWidth: '420px', padding: '12px', backgroundColor: theme.navigationBG, marginBottom: '16px' }}>
        <SwapPoolTabs active={'buy'} />
      </Card>
      <AppBody>
        <AutoColumn gap="lg" justify="center">
          <RowBetween>
            <CurrencySelectWrapper>
              <CurrencySelect
                style={{ width: '100%' }}
                selected={currencySymbol === 'ETH'}
                primary
                left
                className="open-currency-select-button"
                onClick={() => {
                  setCurrencyChanged(true)
                  setCurrency('Ethereum')
                  setCurrencySymbol('ETH')
                }}
              >
                <CurrencyLogo currency={ETH} size={'24px'} />
                <StyledTokenName className="pair-name-container">{ETH.symbol}</StyledTokenName>
              </CurrencySelect>
              <CurrencySelect
                style={{ width: '100%' }}
                selected={currencySymbol !== 'ETH'}
                primary
                right
                className="open-currency-select-button"
                onClick={() => {
                  setCurrencyChanged(true)
                  setCurrency('Chainlink')
                  setCurrencySymbol('LINK')
                }}
              >
                <CurrencyLogo currency={LINK} size={'24px'} />
                <StyledTokenName className="pair-name-container">{LINK.symbol}</StyledTokenName>
              </CurrencySelect>
            </CurrencySelectWrapper>
          </RowBetween>
          <RowBetween padding={'0 8px'}>
            <Text color={theme.textPrimary} fontWeight={500}>
              {t('buyCurrency', { currency: currency })}
            </Text>
            <Question text={t('buyCurrencyDescription', { currency: currency, currencySymbol: currencySymbol })} />
          </RowBetween>
          <Form
            action={WYRE_URL}
            apiKey={WYRE_API_KEY}
            fields={fields}
            render={() => (
              <React.Fragment>
                <Row>
                  <Field {...fields.firstName} />
                  <Field {...fields.lastName} />
                </Row>
                <Row>
                  <Field {...fields.email} />
                </Row>
                <InputPanel id="amountInput">
                  <Container>
                    <LabelRow>
                      <RowBetween>
                        <TYPE.body color={theme.textTertiary} fontWeight={500} fontSize={14}>
                          {t('amountOfUSD')}
                        </TYPE.body>
                      </RowBetween>
                    </LabelRow>
                    <InputRow>
                      <>
                        <NumericalInput
                          style={{ padding: '16px' }}
                          className="token-amount-input"
                          placeholder="0.00"
                          value={amount}
                          onUserInput={val => setAmount(val)}
                        />
                      </>
                    </InputRow>
                  </Container>
                </InputPanel>
                {showLimitHint && (
                  <LimitHint>
                    <TYPE.body color={theme.textSecondary} fontWeight={400} fontSize={14}>
                      <Trans i18nKey="limitHint">
                        Your purchase might exceed the
                        <Link
                          href="https://support.sendwyre.com/en/articles/4457158-card-processing-faqs"
                          target="_blank"
                        >
                          weekly purchase limit
                        </Link>
                        of Wyre
                      </Trans>
                    </TYPE.body>
                  </LimitHint>
                )}
                <Field {...fields.amount} value={amount} />
                <Field {...fields.sourceCurrency} value="USD" />
                <Field {...fields.destCurrency} value={currencySymbol} />
                <Field {...fields.dest} value={ethDestination} />
                <Field {...fields.referrerAccountId} value={WYRE_ID} />
                <Field {...fields.hideTrackBtn} value={true} />
                <Row>
                  {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>{t('connectWallet')}</ButtonLight>
                  ) : (
                    <ButtonPrimary disabled={Boolean(disableBuy)} id="submit" style={{ padding: 16 }}>
                      {t('buyCurrency', { currency: currency })}
                    </ButtonPrimary>
                  )}
                </Row>
                {!account && (
                  <TYPE.body
                    color={theme.appInfoBoxTextColor}
                    style={{ padding: '12px 0', fontSize: '12px' }}
                    textAlign="center"
                  >
                    {t('walletConnectDisclaimer', { currency: currency, currencySymbol: currencySymbol })}
                  </TYPE.body>
                )}
                <RowBetween>
                  <TYPE.body color={theme.appInfoBoxTextColor} style={{ padding: '12px 0 0', fontSize: '12px' }}>
                    {t('gdprDisclaimer')}
                  </TYPE.body>
                </RowBetween>
              </React.Fragment>
            )}
          />
        </AutoColumn>
      </AppBody>
      <BuyFooter currencySymbol={currencySymbol} />
    </>
  )
}
