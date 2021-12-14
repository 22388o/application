import React from 'react'
import AppBody from '../AppBody'
import { Wrapper } from '../../components/swap/styleds'
import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
import styled from 'styled-components'
import { ExternalButton } from '../../components/PositionCard'
import { VRN, YFL } from '../../constants'
import { ExternalLink } from '../../theme'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ArrowRight } from 'react-feather'

const Title = styled.p`
  font-size: 20px;
  margin: 0;
  font-weight: 700;
  text-align: center;
  width: 100%;
`

const StyledArrowRight = styled(ArrowRight)`
  color: ${({ theme }) => theme.textHighlight};
`

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 33%;
  flex: 0 0 33%;
  height: 100%;
  
  &:first-of-type {
    justify-content: flex-end;
  }
  
  &:last-of-type {
    justify-content: flex-start;
  }
`


const Text = styled.p`
  width: 100%;
  margin: 5px 10px 5px 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
`

export default function Swap() {
  return (
    <AppBody>
      <Wrapper id="swap-page">
        <AutoColumn gap={'12px'} style={{ width: '100%' }}>
          <RowBetween style={{ marginTop: '24px' }}>
            <Title>Migrate YFL to VRN</Title>
          </RowBetween>
          <RowBetween>
            <Center>
              <CurrencyLogo size="40px" currency={YFL} />
            </Center>
            <Center>
              <StyledArrowRight />{' '}
            </Center>
            <Center>
              <CurrencyLogo size="40px" currency={VRN} />
            </Center>
          </RowBetween>
          <RowBetween>
            <Text>The Varen Finance DAO was formed on 24th of May 2021.</Text>
          </RowBetween>
          <RowBetween>
            <Text>
              Since then Varen offered a migration interface for holders of the Yflink Community to migrate their $YFL
              tokens to the new $VRN token created by the DAO.
            </Text>
          </RowBetween>
          <RowBetween>
            <Text>
              For a long period of time this migration interface caused a soft-peg between the two tokens. But with the
              launch of Varen Finance's first product{' '}
              <ExternalLink href="https://varenx.com" target="_blank" title="VarenX">
                VarenX
              </ExternalLink>
              , the soft-peg now comes to an end.
            </Text>
          </RowBetween>
          <RowBetween>
            <Text>
              If you still own $YFL tokens, that entered your wallet before the 16th of December 2021, feel free to use
              the new (manual) migration process, by clicking the "Migrate YFL to VRN" button below.
            </Text>
          </RowBetween>
          <RowBetween>
            <ExternalButton href="https://docs.google.com/forms/d/e/1FAIpQLSfO49524F2ackrFuyImT1ih1f8KVQLWZOKkpXJFBSLrBNtAmA/viewform" target="_blank">
              Migrate YFL to VRN
            </ExternalButton>
          </RowBetween>
        </AutoColumn>
      </Wrapper>
    </AppBody>
  )
}
