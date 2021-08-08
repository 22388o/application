import { useVrnPriceManager, useGetVrnPrice } from '../state/price/hooks'
import { useState } from 'react'

export function useVrnUsdPrice(): any {
  const currentTimestamp = () => new Date().getTime()
  const newVrnPrice = useVrnPriceManager()
  const currentVrnPrice = useGetVrnPrice()
  const timeDiff = currentTimestamp() - currentVrnPrice.timestamp
  const [fetching, setFetching] = useState<boolean>(false)
  const [initial, setInitial] = useState<boolean>(false)

  if ((timeDiff > 300000 && !fetching) || !initial) {
    setInitial(true)
    const getVrnPrice = async ({ fetching }: { fetching: boolean }) => {
      if (!fetching) {
        setFetching(true)
        try {
          const response = await fetch('https://api.thegraph.com/subgraphs/name/sushiswap/exchange', {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              operationName: 'tokenDayDatasQuery',
              variables: {
                first: 1,
                date: 0,
                tokens: ['0x72377f31e30a405282b522d588aebbea202b4f23']
              },
              query:
                'query tokenDayDatasQuery($first: Int! = 1000, $tokens: [Bytes]!, $date: Int! = 0) { tokenDayDatas(first: $first, orderBy: date, orderDirection: desc, where: {token_in: $tokens, date_gt: $date}) { id date token { id } priceUSD  }}'
            }),
            method: 'POST'
          })

          if (response.ok) {
            const content = await response.json()
            setFetching(false)
            return Number(content.data.tokenDayDatas[0].priceUSD)
          } else {
            return 0
          }
        } catch (e) {
          setFetching(false)
          return 0
        } finally {
          //console.log('fetched price')
        }
      } else {
        return 0
      }
    }
    getVrnPrice({ fetching: fetching }).then(vrnPrice => {
      if (vrnPrice) {
        newVrnPrice(vrnPrice)
      }
    })
  } else {
    return 0
  }
}
