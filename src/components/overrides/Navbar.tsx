import type { SectionOverride } from 'src/typings/overrides'
import styles from './navbar.module.scss'

const SECTION = 'Navbar' as const

// Keeps the sticky Navbar below sticky BenefitsBar sections
const override: SectionOverride = {
  section: SECTION,
  className: styles.navbar,
}

export { override }
