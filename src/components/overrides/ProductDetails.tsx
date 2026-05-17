import type { SectionOverride } from 'src/typings/overrides'
import CustomProductPrice from '../CustomProductPrice/CustomProductPrice'

const SECTION = 'ProductDetails' as const

const override: SectionOverride = {
  section: SECTION,
  components: {
    ProductPrice: { Component: CustomProductPrice },
  },
}

export { override }
