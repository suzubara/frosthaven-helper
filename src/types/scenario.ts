export type ElementName = 'fire' | 'ice' | 'air' | 'earth' | 'light' | 'dark'
export type ElementState = 'inert' | 'strong' | 'waning'

export type Condition =
  | 'poison' | 'wound' | 'brittle' | 'bane' | 'stun' | 'muddle'
  | 'immobilize' | 'disarm' | 'impair'
  | 'strengthen' | 'invisible' | 'regenerate' | 'ward'

export type MonsterRank = 'normal' | 'elite' | 'boss'

export interface ScenarioSession {
  id: string
  name: string
  round: number
  elements: Record<ElementName, ElementState>
  characters: CharacterState[]
  monsterGroups: MonsterGroup[]
  createdAt: number
  updatedAt: number
}

export interface CharacterState {
  id: string
  name: string
  maxHp: number
  currentHp: number
  xp: number
  conditions: Condition[]
}

export interface MonsterGroup {
  id: string
  name: string
  maxHpNormal: number
  maxHpElite: number
  standees: MonsterStandee[]
}

export interface MonsterStandee {
  id: string
  standeeNumber: number
  rank: MonsterRank
  currentHp: number
  conditions: Condition[]
  alive: boolean
}
