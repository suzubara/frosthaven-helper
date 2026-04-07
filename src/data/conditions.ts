import type { Condition } from '@/types/scenario'

export const NEGATIVE_CONDITIONS: Condition[] = [
  'poison', 'wound', 'brittle', 'bane', 'stun', 'muddle',
  'immobilize', 'disarm', 'impair',
]

export const POSITIVE_CONDITIONS: Condition[] = [
  'strengthen', 'invisible', 'regenerate', 'ward',
]

export const ALL_CONDITIONS: Condition[] = [
  ...NEGATIVE_CONDITIONS,
  ...POSITIVE_CONDITIONS,
]

/** Conditions removed automatically at end of the entity's turn */
export const TURN_END_CONDITIONS: Condition[] = [
  'invisible', 'strengthen', 'immobilize', 'disarm', 'impair', 'stun', 'muddle',
]

/** Conditions removed when the entity is healed (HP increases) */
export const HEAL_CONDITIONS: Condition[] = [
  'wound', 'brittle', 'bane',
]

/** Conditions removed when the entity takes damage (HP decreases) */
export const DAMAGE_CONDITIONS: Condition[] = [
  'regenerate', 'ward', 'brittle', 'bane',
]
