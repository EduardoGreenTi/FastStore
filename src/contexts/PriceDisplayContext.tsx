import { createContext, useContext } from 'react'

interface PriceDisplayContextValue {
  priceLabel: string
}

export const PriceDisplayContext = createContext<PriceDisplayContextValue>({
  priceLabel: '',
})

export const usePriceDisplay = () => useContext(PriceDisplayContext)
