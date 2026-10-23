import type { SectionOverride } from 'src/typings/overrides'
import CustomProductPrice from '../CustomProductPrice/CustomProductPrice'
import NotifyMe from '../NotifyMe/NotifyMe'

const SECTION = 'ProductDetails' as const

const override: SectionOverride = {
  section: SECTION,
  components: {
    ProductPrice: { Component: CustomProductPrice },
    __experimentalNotAvailableButton: { Component: NotifyMe },
  },
}

export { override }
