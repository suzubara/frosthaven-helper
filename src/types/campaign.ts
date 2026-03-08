// === Resources ===

export type MaterialResource = 'lumber' | 'metal' | 'hide'
export type HerbResource =
  | 'arrowvine'
  | 'axenut'
  | 'corpsecap'
  | 'flamefruit'
  | 'rockroot'
  | 'snowthistle'
export type ResourceType = MaterialResource | HerbResource

// === Calendar ===

export type Season = 'summer' | 'winter'

export interface CalendarWeek {
  marked: boolean
  sections: string[]
}

// === Party Characters ===

export interface PartyCharacter {
  id: string
  name: string
  className: string
  level: number
  maxHp: number
  retired: boolean
}

// === Buildings ===

export type BuildingStatus = 'locked' | 'unlocked' | 'wrecked'

export interface Building {
  id: string
  name: string
  level: number
  status: BuildingStatus
}

// === Retirement ===

export interface RetirementRecord {
  characterName: string
  className: string
  level: number
  retiredAt: number
}

// === Campaign ===

export interface Campaign {
  id: string
  name: string
  calendar: CalendarWeek[]
  resources: Record<ResourceType, number>
  morale: number
  prosperityCheckmarks: number
  totalDefense: number
  soldiers: number
  barracksMaxSoldiers: number
  inspiration: number
  buildings: Building[]
  party: PartyCharacter[]
  campaignStickers: string[]
  notes: string
  retirements: RetirementRecord[]
  createdAt: number
  updatedAt: number
}
