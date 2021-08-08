import { createReducer } from '@reduxjs/toolkit'
import { updatePriceBase, updateWyreObject, updateTokenPrices, updateLPTokenPrices, updateVrnPrice } from './actions'

const currentTimestamp = () => new Date().getTime()

export interface PriceState {
  lastUpdateVersionTimestamp?: number
  ethPriceBase: number // the ETH price base
  linkPriceBase: number // the LINK price base
  yflPriceBase: number // the YFL price base
  yflusdPriceBase: number // the YFLUSD price base
  vrnPrice: number // vrn price
  priceResponse: any | false // wyre response
  tokenPrices: any | false // token prices
  lpTokenPrices: any | false // token prices
  timestamp: number
}

export const initialState: PriceState = {
  ethPriceBase: 0,
  linkPriceBase: 0,
  yflPriceBase: 0,
  yflusdPriceBase: 0,
  priceResponse: false,
  tokenPrices: false,
  vrnPrice: 0,
  lpTokenPrices: false,
  timestamp: currentTimestamp()
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updatePriceBase, (state, action) => {
      state.ethPriceBase = action.payload.ethPriceBase
      state.linkPriceBase = action.payload.linkPriceBase
      state.yflPriceBase = action.payload.yflPriceBase
      state.yflusdPriceBase = action.payload.yflusdPriceBase
      state.timestamp = currentTimestamp()
    })
    .addCase(updateWyreObject, (state, action) => {
      state.priceResponse = action.payload.priceResponse
      state.timestamp = currentTimestamp()
    })
    .addCase(updateTokenPrices, (state, action) => {
      state.tokenPrices = action.payload.tokenPrices
      state.timestamp = currentTimestamp()
    })
    .addCase(updateVrnPrice, (state, action) => {
      state.vrnPrice = action.payload.vrnPrice
      state.timestamp = currentTimestamp()
    })
    .addCase(updateLPTokenPrices, (state, action) => {
      state.lpTokenPrices = action.payload.lpTokenPrices
      state.timestamp = currentTimestamp()
    })
)
