import React, { Suspense } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Web3ReactManager from '../components/Web3ReactManager'
import ThemeQueryParamReader from '../theme/ThemeQueryParamReader'
import Swap from './Swap'
import {
  RedirectPathToSwapOnly,
  RedirectToSwap,
  RedirectThemeOutputToSwap,
  RedirectThemeInputOutputToSwap
} from './Swap/redirects'
import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './AddLiquidity/redirects'
import Buy from './Buy'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import Ren from './Bridges/ren'
import RemoveLiquidity from './RemoveLiquidity'

import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import CreatePair from './CreatePair'
import { CreatePairRedirectOldPathStructure, CreatePairRedirectDuplicateTokenIds } from './CreatePair/redirects'
import PreviewListing from './PreviewListing'
import Analyze from './Analyze'
import StakeOverview from './Stake'
import {
  RedirectTo88mph,
  RedirectTo88mphWithdraw,
  RedirectToScrtStake,
  RedirectToScrtUnstake,
  RedirectToStake,
  RedirectToStakeWithParam,
  RedirectToUnstake
} from './Stake/redirects'
import Navigation from '../components/Navigation'
import { RedirectToRenBridge, RedirectToScrtBridge } from './Bridges/redirects'
import Popups from '../components/Popups'
import StakeGovernance from './Stake/Governance'
import Bridges from './Bridges'
import Scrt from './Bridges/scrt'
import { useGetTheme } from '../state/user/hooks'

const AppWrapper = styled.div<{ currentTheme: string }>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  height: 100%;
  min-height: calc(100vh - 220px);
  padding-bottom: 40px;
  background: ${({ theme }) => theme.layerBG};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    background: ${({ theme }) => theme.layerBGTablet};
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    background: ${({ theme }) => theme.layerBGMobile};
  `};
  ${({ currentTheme }) => currentTheme === 'default' && 'background: transparent !important;'};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  z-index: 2;
  position: relative;
`

const BodyWrapper = styled.div`
  min-height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  width: calc(100% - 300px);
  padding-top: 70px;
  align-items: center;
  box-sizing: content-box;
  flex: 1;
  z-index: 3;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    z-index: 1;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 0 16px;
  `};
`

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: -320px;
  right: 0;
  pointer-events: none;
  max-width: 200vw !important;
  height: 100vw;
  position: absolute;
  z-index: 1;
  background: ${({ theme }) => theme.layerBG};
  transform: translateY(-50vw);
  ${({ theme }) => theme.mediaWidth.upToMedium`
    left: 0;
  `};
`
const BackgroundImage = styled.div`
  position: absolute;
  height: 100%;
  width: 100vw;
  background-position: 0 200px;
  background-size: calc(50vw - 380px) auto;
  background-repeat: no-repeat;
  background-image: url('../images/themes/default/bg.svg');
  z-index: 2;
  opacity: 0.05;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

export default function App() {
  const currentTheme = useGetTheme()

  return (
    <Suspense fallback={null}>
      <HashRouter>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={ThemeQueryParamReader} />
        <AppWrapper currentTheme={currentTheme}>
          {currentTheme === 'default' && (
            <>
              <BackgroundGradient />
              <BackgroundImage />
            </>
          )}
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <Navigation />
          <BodyWrapper>
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path="/buy" component={Buy} />
                <Route exact strict path="/swap" component={Swap} />
                <Route exact strict path="/swap/:inputCurrency" component={RedirectToSwap} />
                <Route exact strict path="/swap/:theme/:outputCurrency" component={RedirectThemeOutputToSwap} />
                <Route
                  exact
                  strict
                  path="/swap/:theme/:inputCurrency/:outputCurrency"
                  component={RedirectThemeInputOutputToSwap}
                />
                <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                <Route exact strict path="/find" component={PoolFinder} />
                <Route exact strict path="/pool" component={Pool} />
                <Route exact path="/add" component={AddLiquidity} />
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                <Route exact path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                <Route exact strict path="/create" component={CreatePair} />
                <Route exact strict path="/stake" component={StakeOverview} />
                <Route exact strict path="/unstake" component={StakeOverview} />
                <Route exact path="/manage/mph88/:vaultName" component={RedirectTo88mphWithdraw} />
                <Route exact path="/stake-scrt/:currency" component={RedirectToScrtStake} />
                <Route exact path="/stake/mph88/:vaultName" component={RedirectTo88mph} />
                <Route exact path="/stake/gov" component={StakeGovernance} />
                <Route exact path="/stake/:param" component={RedirectToStakeWithParam} />
                <Route exact path="/stake/:currencyIdA/:currencyIdB" component={RedirectToStake} />
                <Route exact path="/unstake-scrt/:currency" component={RedirectToScrtUnstake} />
                <Route exact path="/unstake/:currencyIdA/:currencyIdB" component={RedirectToUnstake} />
                <Route exact path="/create/:currencyIdA" component={CreatePairRedirectOldPathStructure} />
                <Route exact path="/create/:currencyIdA/:currencyIdB" component={CreatePairRedirectDuplicateTokenIds} />
                <Route exact strict path="/previewlisting" component={PreviewListing} />
                <Route exact strict path="/analyze" component={Analyze} />
                <Route exact strict path="/bridges" component={Bridges} />
                <Route exact strict path="/bridges/ren/:bridgeName" component={RedirectToRenBridge} />
                <Route exact strict path="/ren" component={Ren} />
                <Route exact strict path="/ren/:bridgeName" component={RedirectToRenBridge} />
                <Route exact strict path="/scrt" component={Scrt} />
                <Route exact strict path="/scrt/:bridgeName" component={RedirectToScrtBridge} />
                <Route exact strict path="/bridges/scrt/:bridgeName" component={RedirectToScrtBridge} />
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
          </BodyWrapper>
        </AppWrapper>
      </HashRouter>
    </Suspense>
  )
}
