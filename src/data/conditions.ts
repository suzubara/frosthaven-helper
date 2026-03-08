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
