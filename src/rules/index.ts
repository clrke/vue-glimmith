import type { RuleValidator, RuleName } from './types'
import { sizeRule } from './size'
import { sizeSeparationRule } from './sizeSeparation'

export { sizeRule } from './size'
export { sizeSeparationRule } from './sizeSeparation'
export type { RuleValidator, Violation, RuleName } from './types'

/** Every implemented rule, keyed by its registry name. */
export const ruleRegistry: Record<RuleName, RuleValidator> = {
  size: sizeRule,
  sizeSeparation: sizeSeparationRule,
}
