import { ProductPrice as UIProductPrice } from '@faststore/ui'
import type { ProductPriceProps } from '@faststore/ui'
import { usePriceDisplay } from 'src/customizations/src/contexts/PriceDisplayContext'

function CustomProductPrice(props: ProductPriceProps) {
  const { priceLabel } = usePriceDisplay()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {priceLabel && (
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>
          {priceLabel}
        </span>
      )}
      <UIProductPrice {...props} />
    </div>
  )
}

export default CustomProductPrice
