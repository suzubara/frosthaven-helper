import type {
  Building,
  Campaign,
  PartyCharacter,
  ResourceType,
  RetirementRecord,
} from '@/types/campaign'

export type CampaignAction =
  // Session
  | { type: 'LOAD_CAMPAIGN'; campaign: Campaign }
  | { type: 'END_CAMPAIGN' }

  // Calendar
  | { type: 'MARK_WEEK' }
  | { type: 'UNMARK_WEEK' }
  | { type: 'ADD_CALENDAR_SECTION'; weekIndex: number; section: string }
  | { type: 'REMOVE_CALENDAR_SECTION'; weekIndex: number; section: string }

  // Resources
  | { type: 'UPDATE_RESOURCE'; resource: ResourceType; delta: number }

  // Morale
  | { type: 'UPDATE_MORALE'; delta: number }

  // Prosperity
  | { type: 'UPDATE_PROSPERITY'; delta: number }

  // Defense, Soldiers, Inspiration
  | { type: 'UPDATE_DEFENSE'; delta: number }
  | { type: 'UPDATE_SOLDIERS'; delta: number }
  | { type: 'UPDATE_INSPIRATION'; delta: number }

  // Buildings
  | { type: 'ADD_BUILDING'; building: Building }
  | { type: 'REMOVE_BUILDING'; buildingId: string }
  | { type: 'UPGRADE_BUILDING'; buildingId: string }
  | { type: 'WRECK_BUILDING'; buildingId: string }
  | { type: 'REBUILD_BUILDING'; buildingId: string }

  // Party
  | { type: 'ADD_CHARACTER'; character: PartyCharacter }
  | { type: 'REMOVE_CHARACTER'; characterId: string }
  | {
      type: 'UPDATE_CHARACTER'
      characterId: string
      updates: Partial<Pick<PartyCharacter, 'name' | 'className' | 'level' | 'maxHp'>>
    }
  | { type: 'RETIRE_CHARACTER'; characterId: string }

  // Notes & Stickers
  | { type: 'ADD_STICKER'; sticker: string }
  | { type: 'REMOVE_STICKER'; sticker: string }
  | { type: 'UPDATE_NOTES'; notes: string }

  // Retirements
  | { type: 'ADD_RETIREMENT'; record: RetirementRecord }

  // Barracks
  | { type: 'UPDATE_BARRACKS_MAX'; max: number }

export const initialState: Campaign | null = null

// --- Prosperity helpers ---

const PROSPERITY_THRESHOLDS = [0, 4, 9, 15, 22, 30, 39, 49, 64] as const

export function getProsperityLevel(checkmarks: number): number {
  for (let i = PROSPERITY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (checkmarks >= PROSPERITY_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

export function getMaxStartingLevel(prosperityLevel: number): number {
  return Math.ceil(prosperityLevel / 2)
}

// --- Morale → Defense modifier ---

const MORALE_DEFENSE_TABLE: [number, number, number][] = [
  [0, 2, -10],
  [3, 4, -5],
  [5, 6, -2],
  [7, 8, -1],
  [9, 11, 0],
  [12, 13, 1],
  [14, 15, 2],
  [16, 17, 5],
  [18, 20, 10],
]

export function getMoraleDefenseModifier(morale: number): number {
  for (const [min, max, mod] of MORALE_DEFENSE_TABLE) {
    if (morale >= min && morale <= max) {
      return mod
    }
  }
  return 0
}

// --- Calendar helpers ---

export function getCurrentWeekIndex(calendar: Campaign['calendar']): number {
  return calendar.findIndex((w) => !w.marked)
}

export function getCalendarPosition(markedWeeks: number) {
  const year = Math.floor(markedWeeks / 20) + 1
  const weekInYear = markedWeeks % 20
  const season: 'summer' | 'winter' = weekInYear < 10 ? 'summer' : 'winter'
  const weekInSeason = (markedWeeks % 10) + 1
  return { year, season, weekInSeason }
}

// --- Building helpers ---

function updateBuilding(
  buildings: Building[],
  buildingId: string,
  updater: (b: Building) => Building,
): Building[] {
  return buildings.map((b) => (b.id === buildingId ? updater(b) : b))
}

// --- Reducer ---

export function campaignReducer(
  state: Campaign | null,
  action: CampaignAction,
): Campaign | null {
  if (action.type === 'LOAD_CAMPAIGN') {
    return action.campaign
  }

  if (action.type === 'END_CAMPAIGN') {
    return null
  }

  if (state === null) {
    return state
  }

  switch (action.type) {
    // Calendar
    case 'MARK_WEEK': {
      const nextIndex = getCurrentWeekIndex(state.calendar)
      if (nextIndex === -1) return state
      const calendar = state.calendar.map((w, i) =>
        i === nextIndex ? { ...w, marked: true } : w,
      )
      return { ...state, calendar }
    }

    case 'UNMARK_WEEK': {
      const lastMarkedIndex = state.calendar.reduce(
        (last, w, i) => (w.marked ? i : last),
        -1,
      )
      if (lastMarkedIndex === -1) return state
      const calendar = state.calendar.map((w, i) =>
        i === lastMarkedIndex ? { ...w, marked: false } : w,
      )
      return { ...state, calendar }
    }

    case 'ADD_CALENDAR_SECTION': {
      const calendar = state.calendar.map((w, i) =>
        i === action.weekIndex
          ? { ...w, sections: [...w.sections, action.section] }
          : w,
      )
      return { ...state, calendar }
    }

    case 'REMOVE_CALENDAR_SECTION': {
      const calendar = state.calendar.map((w, i) =>
        i === action.weekIndex
          ? {
              ...w,
              sections: w.sections.filter((s) => s !== action.section),
            }
          : w,
      )
      return { ...state, calendar }
    }

    // Resources
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.resource]: Math.max(
            0,
            state.resources[action.resource] + action.delta,
          ),
        },
      }

    // Morale
    case 'UPDATE_MORALE':
      return {
        ...state,
        morale: Math.max(0, Math.min(20, state.morale + action.delta)),
      }

    // Prosperity
    case 'UPDATE_PROSPERITY':
      return {
        ...state,
        prosperityCheckmarks: Math.max(
          0,
          state.prosperityCheckmarks + action.delta,
        ),
      }

    // Defense
    case 'UPDATE_DEFENSE':
      return {
        ...state,
        totalDefense: state.totalDefense + action.delta,
      }

    // Soldiers
    case 'UPDATE_SOLDIERS':
      return {
        ...state,
        soldiers: Math.max(
          0,
          Math.min(state.barracksMaxSoldiers, state.soldiers + action.delta),
        ),
      }

    // Inspiration
    case 'UPDATE_INSPIRATION':
      return {
        ...state,
        inspiration: Math.max(0, state.inspiration + action.delta),
      }

    // Buildings
    case 'ADD_BUILDING':
      return {
        ...state,
        buildings: [...state.buildings, action.building],
      }

    case 'REMOVE_BUILDING':
      return {
        ...state,
        buildings: state.buildings.filter((b) => b.id !== action.buildingId),
      }

    case 'UPGRADE_BUILDING':
      return {
        ...state,
        buildings: updateBuilding(state.buildings, action.buildingId, (b) => ({
          ...b,
          level: b.level + 1,
        })),
      }

    case 'WRECK_BUILDING':
      return {
        ...state,
        buildings: updateBuilding(state.buildings, action.buildingId, (b) => ({
          ...b,
          status: 'wrecked',
        })),
      }

    case 'REBUILD_BUILDING':
      return {
        ...state,
        buildings: updateBuilding(state.buildings, action.buildingId, (b) => ({
          ...b,
          status: 'unlocked',
        })),
      }

    // Party
    case 'ADD_CHARACTER':
      return {
        ...state,
        party: [...state.party, action.character],
      }

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        party: state.party.filter((c) => c.id !== action.characterId),
      }

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        party: state.party.map((c) =>
          c.id === action.characterId ? { ...c, ...action.updates } : c,
        ),
      }

    case 'RETIRE_CHARACTER':
      return {
        ...state,
        party: state.party.map((c) =>
          c.id === action.characterId ? { ...c, retired: true } : c,
        ),
      }

    // Notes & Stickers
    case 'ADD_STICKER':
      return {
        ...state,
        campaignStickers: [...state.campaignStickers, action.sticker],
      }

    case 'REMOVE_STICKER':
      return {
        ...state,
        campaignStickers: state.campaignStickers.filter(
          (s) => s !== action.sticker,
        ),
      }

    case 'UPDATE_NOTES':
      return {
        ...state,
        notes: action.notes,
      }

    // Retirements
    case 'ADD_RETIREMENT':
      return {
        ...state,
        retirements: [...state.retirements, action.record],
      }

    // Barracks
    case 'UPDATE_BARRACKS_MAX':
      return {
        ...state,
        barracksMaxSoldiers: action.max,
      }

    default:
      return state
  }
}
