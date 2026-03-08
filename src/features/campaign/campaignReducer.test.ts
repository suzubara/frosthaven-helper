import { describe, it, expect } from 'vitest'
import {
  campaignReducer,
  initialState,
  getProsperityLevel,
  getMaxStartingLevel,
  getMoraleDefenseModifier,
  getCalendarPosition,
} from './campaignReducer'
import type {
  Building,
  Campaign,
  CalendarWeek,
  PartyCharacter,
} from '@/types/campaign'

function createTestCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'test-campaign',
    name: 'Test Campaign',
    calendar: Array.from({ length: 80 }, () => ({
      marked: false,
      sections: [],
    })),
    resources: {
      lumber: 0,
      metal: 0,
      hide: 0,
      arrowvine: 0,
      axenut: 0,
      corpsecap: 0,
      flamefruit: 0,
      rockroot: 0,
      snowthistle: 0,
    },
    morale: 10,
    prosperityCheckmarks: 0,
    totalDefense: 0,
    soldiers: 0,
    barracksMaxSoldiers: 4,
    inspiration: 0,
    buildings: [],
    party: [],
    campaignStickers: [],
    notes: '',
    retirements: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  }
}

function createTestBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: 'building-1',
    name: 'Craftsman',
    level: 1,
    status: 'unlocked',
    ...overrides,
  }
}

function createTestCharacter(
  overrides: Partial<PartyCharacter> = {},
): PartyCharacter {
  return {
    id: 'char-1',
    name: 'Brynn',
    className: 'Banner Spear',
    level: 1,
    maxHp: 10,
    retired: false,
    ...overrides,
  }
}

function createCalendarWithMarked(count: number): CalendarWeek[] {
  return Array.from({ length: 80 }, (_, i) => ({
    marked: i < count,
    sections: [],
  }))
}

describe('campaignReducer', () => {
  describe('initialState', () => {
    it('should be null', () => {
      expect(initialState).toBeNull()
    })
  })

  describe('when state is null', () => {
    it('should return null for actions other than LOAD_CAMPAIGN', () => {
      const result = campaignReducer(null, { type: 'MARK_WEEK' })
      expect(result).toBeNull()
    })

    it('should handle LOAD_CAMPAIGN', () => {
      const campaign = createTestCampaign()
      const result = campaignReducer(null, {
        type: 'LOAD_CAMPAIGN',
        campaign,
      })
      expect(result).toEqual(campaign)
    })
  })

  describe('END_CAMPAIGN', () => {
    it('should return null', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, { type: 'END_CAMPAIGN' })
      expect(result).toBeNull()
    })
  })

  // --- Calendar ---

  describe('MARK_WEEK', () => {
    it('should mark the first unmarked week', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, { type: 'MARK_WEEK' })
      expect(result?.calendar[0].marked).toBe(true)
      expect(result?.calendar[1].marked).toBe(false)
    })

    it('should mark the next unmarked week when some are already marked', () => {
      const state = createTestCampaign({
        calendar: createCalendarWithMarked(5),
      })
      const result = campaignReducer(state, { type: 'MARK_WEEK' })
      expect(result?.calendar[5].marked).toBe(true)
      expect(result?.calendar[4].marked).toBe(true)
    })

    it('should not change state when all weeks are marked', () => {
      const state = createTestCampaign({
        calendar: createCalendarWithMarked(80),
      })
      const result = campaignReducer(state, { type: 'MARK_WEEK' })
      expect(result).toBe(state)
    })
  })

  describe('UNMARK_WEEK', () => {
    it('should unmark the last marked week', () => {
      const state = createTestCampaign({
        calendar: createCalendarWithMarked(3),
      })
      const result = campaignReducer(state, { type: 'UNMARK_WEEK' })
      expect(result?.calendar[2].marked).toBe(false)
      expect(result?.calendar[1].marked).toBe(true)
    })

    it('should not change state when no weeks are marked', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, { type: 'UNMARK_WEEK' })
      expect(result).toBe(state)
    })
  })

  describe('ADD_CALENDAR_SECTION', () => {
    it('should add a section to the specified week', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, {
        type: 'ADD_CALENDAR_SECTION',
        weekIndex: 5,
        section: '42',
      })
      expect(result?.calendar[5].sections).toEqual(['42'])
    })

    it('should append to existing sections', () => {
      const calendar = createCalendarWithMarked(0)
      calendar[5] = { marked: false, sections: ['10'] }
      const state = createTestCampaign({ calendar })
      const result = campaignReducer(state, {
        type: 'ADD_CALENDAR_SECTION',
        weekIndex: 5,
        section: '42',
      })
      expect(result?.calendar[5].sections).toEqual(['10', '42'])
    })
  })

  describe('REMOVE_CALENDAR_SECTION', () => {
    it('should remove a section from the specified week', () => {
      const calendar = createCalendarWithMarked(0)
      calendar[5] = { marked: false, sections: ['10', '42'] }
      const state = createTestCampaign({ calendar })
      const result = campaignReducer(state, {
        type: 'REMOVE_CALENDAR_SECTION',
        weekIndex: 5,
        section: '10',
      })
      expect(result?.calendar[5].sections).toEqual(['42'])
    })
  })

  // --- Resources ---

  describe('UPDATE_RESOURCE', () => {
    it('should increment a resource', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, {
        type: 'UPDATE_RESOURCE',
        resource: 'lumber',
        delta: 3,
      })
      expect(result?.resources.lumber).toBe(3)
    })

    it('should decrement a resource', () => {
      const state = createTestCampaign({
        resources: {
          ...createTestCampaign().resources,
          metal: 5,
        },
      })
      const result = campaignReducer(state, {
        type: 'UPDATE_RESOURCE',
        resource: 'metal',
        delta: -2,
      })
      expect(result?.resources.metal).toBe(3)
    })

    it('should clamp resources at 0', () => {
      const state = createTestCampaign({
        resources: {
          ...createTestCampaign().resources,
          hide: 2,
        },
      })
      const result = campaignReducer(state, {
        type: 'UPDATE_RESOURCE',
        resource: 'hide',
        delta: -5,
      })
      expect(result?.resources.hide).toBe(0)
    })

    it('should work with herb resources', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, {
        type: 'UPDATE_RESOURCE',
        resource: 'arrowvine',
        delta: 2,
      })
      expect(result?.resources.arrowvine).toBe(2)
    })
  })

  // --- Morale ---

  describe('UPDATE_MORALE', () => {
    it('should increment morale', () => {
      const state = createTestCampaign({ morale: 10 })
      const result = campaignReducer(state, {
        type: 'UPDATE_MORALE',
        delta: 2,
      })
      expect(result?.morale).toBe(12)
    })

    it('should clamp morale at 20', () => {
      const state = createTestCampaign({ morale: 19 })
      const result = campaignReducer(state, {
        type: 'UPDATE_MORALE',
        delta: 5,
      })
      expect(result?.morale).toBe(20)
    })

    it('should clamp morale at 0', () => {
      const state = createTestCampaign({ morale: 2 })
      const result = campaignReducer(state, {
        type: 'UPDATE_MORALE',
        delta: -5,
      })
      expect(result?.morale).toBe(0)
    })
  })

  // --- Prosperity ---

  describe('UPDATE_PROSPERITY', () => {
    it('should add checkmarks', () => {
      const state = createTestCampaign({ prosperityCheckmarks: 3 })
      const result = campaignReducer(state, {
        type: 'UPDATE_PROSPERITY',
        delta: 2,
      })
      expect(result?.prosperityCheckmarks).toBe(5)
    })

    it('should remove checkmarks', () => {
      const state = createTestCampaign({ prosperityCheckmarks: 5 })
      const result = campaignReducer(state, {
        type: 'UPDATE_PROSPERITY',
        delta: -2,
      })
      expect(result?.prosperityCheckmarks).toBe(3)
    })

    it('should clamp checkmarks at 0', () => {
      const state = createTestCampaign({ prosperityCheckmarks: 2 })
      const result = campaignReducer(state, {
        type: 'UPDATE_PROSPERITY',
        delta: -5,
      })
      expect(result?.prosperityCheckmarks).toBe(0)
    })
  })

  // --- Defense ---

  describe('UPDATE_DEFENSE', () => {
    it('should adjust defense', () => {
      const state = createTestCampaign({ totalDefense: 3 })
      const result = campaignReducer(state, {
        type: 'UPDATE_DEFENSE',
        delta: 2,
      })
      expect(result?.totalDefense).toBe(5)
    })

    it('should allow negative defense', () => {
      const state = createTestCampaign({ totalDefense: 1 })
      const result = campaignReducer(state, {
        type: 'UPDATE_DEFENSE',
        delta: -5,
      })
      expect(result?.totalDefense).toBe(-4)
    })
  })

  // --- Soldiers ---

  describe('UPDATE_SOLDIERS', () => {
    it('should increment soldiers', () => {
      const state = createTestCampaign({ soldiers: 2, barracksMaxSoldiers: 4 })
      const result = campaignReducer(state, {
        type: 'UPDATE_SOLDIERS',
        delta: 1,
      })
      expect(result?.soldiers).toBe(3)
    })

    it('should clamp at barracks max', () => {
      const state = createTestCampaign({ soldiers: 3, barracksMaxSoldiers: 4 })
      const result = campaignReducer(state, {
        type: 'UPDATE_SOLDIERS',
        delta: 5,
      })
      expect(result?.soldiers).toBe(4)
    })

    it('should clamp at 0', () => {
      const state = createTestCampaign({ soldiers: 2 })
      const result = campaignReducer(state, {
        type: 'UPDATE_SOLDIERS',
        delta: -5,
      })
      expect(result?.soldiers).toBe(0)
    })
  })

  // --- Inspiration ---

  describe('UPDATE_INSPIRATION', () => {
    it('should increment inspiration', () => {
      const state = createTestCampaign({ inspiration: 3 })
      const result = campaignReducer(state, {
        type: 'UPDATE_INSPIRATION',
        delta: 2,
      })
      expect(result?.inspiration).toBe(5)
    })

    it('should clamp at 0', () => {
      const state = createTestCampaign({ inspiration: 2 })
      const result = campaignReducer(state, {
        type: 'UPDATE_INSPIRATION',
        delta: -5,
      })
      expect(result?.inspiration).toBe(0)
    })
  })

  // --- Buildings ---

  describe('ADD_BUILDING', () => {
    it('should add a building', () => {
      const state = createTestCampaign()
      const building = createTestBuilding()
      const result = campaignReducer(state, {
        type: 'ADD_BUILDING',
        building,
      })
      expect(result?.buildings).toHaveLength(1)
      expect(result?.buildings[0]).toEqual(building)
    })
  })

  describe('REMOVE_BUILDING', () => {
    it('should remove a building by id', () => {
      const building = createTestBuilding()
      const state = createTestCampaign({ buildings: [building] })
      const result = campaignReducer(state, {
        type: 'REMOVE_BUILDING',
        buildingId: 'building-1',
      })
      expect(result?.buildings).toHaveLength(0)
    })
  })

  describe('UPGRADE_BUILDING', () => {
    it('should increment building level', () => {
      const building = createTestBuilding({ level: 1 })
      const state = createTestCampaign({ buildings: [building] })
      const result = campaignReducer(state, {
        type: 'UPGRADE_BUILDING',
        buildingId: 'building-1',
      })
      expect(result?.buildings[0].level).toBe(2)
    })
  })

  describe('WRECK_BUILDING', () => {
    it('should set status to wrecked', () => {
      const building = createTestBuilding({ status: 'unlocked' })
      const state = createTestCampaign({ buildings: [building] })
      const result = campaignReducer(state, {
        type: 'WRECK_BUILDING',
        buildingId: 'building-1',
      })
      expect(result?.buildings[0].status).toBe('wrecked')
    })
  })

  describe('REBUILD_BUILDING', () => {
    it('should set status to unlocked', () => {
      const building = createTestBuilding({ status: 'wrecked' })
      const state = createTestCampaign({ buildings: [building] })
      const result = campaignReducer(state, {
        type: 'REBUILD_BUILDING',
        buildingId: 'building-1',
      })
      expect(result?.buildings[0].status).toBe('unlocked')
    })
  })

  // --- Party ---

  describe('ADD_CHARACTER', () => {
    it('should add a character to the party', () => {
      const state = createTestCampaign()
      const character = createTestCharacter()
      const result = campaignReducer(state, {
        type: 'ADD_CHARACTER',
        character,
      })
      expect(result?.party).toHaveLength(1)
      expect(result?.party[0]).toEqual(character)
    })
  })

  describe('REMOVE_CHARACTER', () => {
    it('should remove a character by id', () => {
      const character = createTestCharacter()
      const state = createTestCampaign({ party: [character] })
      const result = campaignReducer(state, {
        type: 'REMOVE_CHARACTER',
        characterId: 'char-1',
      })
      expect(result?.party).toHaveLength(0)
    })

    it('should not remove other characters', () => {
      const char1 = createTestCharacter({ id: 'char-1' })
      const char2 = createTestCharacter({ id: 'char-2', name: 'Kael' })
      const state = createTestCampaign({ party: [char1, char2] })
      const result = campaignReducer(state, {
        type: 'REMOVE_CHARACTER',
        characterId: 'char-1',
      })
      expect(result?.party).toHaveLength(1)
      expect(result?.party[0].id).toBe('char-2')
    })
  })

  describe('UPDATE_CHARACTER', () => {
    it('should update character fields', () => {
      const character = createTestCharacter({ level: 1, maxHp: 10 })
      const state = createTestCampaign({ party: [character] })
      const result = campaignReducer(state, {
        type: 'UPDATE_CHARACTER',
        characterId: 'char-1',
        updates: { level: 3, maxHp: 14 },
      })
      expect(result?.party[0].level).toBe(3)
      expect(result?.party[0].maxHp).toBe(14)
      expect(result?.party[0].name).toBe('Brynn')
    })
  })

  describe('RETIRE_CHARACTER', () => {
    it('should set retired to true', () => {
      const character = createTestCharacter()
      const state = createTestCampaign({ party: [character] })
      const result = campaignReducer(state, {
        type: 'RETIRE_CHARACTER',
        characterId: 'char-1',
      })
      expect(result?.party[0].retired).toBe(true)
    })
  })

  // --- Notes & Stickers ---

  describe('ADD_STICKER', () => {
    it('should add a sticker', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, {
        type: 'ADD_STICKER',
        sticker: 'Ancient Technology',
      })
      expect(result?.campaignStickers).toEqual(['Ancient Technology'])
    })
  })

  describe('REMOVE_STICKER', () => {
    it('should remove a sticker', () => {
      const state = createTestCampaign({
        campaignStickers: ['Ancient Technology', 'Into the Forest'],
      })
      const result = campaignReducer(state, {
        type: 'REMOVE_STICKER',
        sticker: 'Ancient Technology',
      })
      expect(result?.campaignStickers).toEqual(['Into the Forest'])
    })
  })

  describe('UPDATE_NOTES', () => {
    it('should update notes', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, {
        type: 'UPDATE_NOTES',
        notes: 'We unlocked scenario 42',
      })
      expect(result?.notes).toBe('We unlocked scenario 42')
    })
  })

  // --- Retirements ---

  describe('ADD_RETIREMENT', () => {
    it('should add a retirement record', () => {
      const state = createTestCampaign()
      const record = {
        characterName: 'Old Gregor',
        className: 'Boneshaper',
        level: 4,
        retiredAt: 5000,
      }
      const result = campaignReducer(state, {
        type: 'ADD_RETIREMENT',
        record,
      })
      expect(result?.retirements).toHaveLength(1)
      expect(result?.retirements[0]).toEqual(record)
    })
  })

  // --- Barracks ---

  describe('UPDATE_BARRACKS_MAX', () => {
    it('should update barracks max soldiers', () => {
      const state = createTestCampaign()
      const result = campaignReducer(state, {
        type: 'UPDATE_BARRACKS_MAX',
        max: 6,
      })
      expect(result?.barracksMaxSoldiers).toBe(6)
    })
  })

  describe('LOAD_CAMPAIGN', () => {
    it('should replace the entire state', () => {
      const oldState = createTestCampaign({ morale: 15 })
      const newCampaign = createTestCampaign({ morale: 5, name: 'New Game' })
      const result = campaignReducer(oldState, {
        type: 'LOAD_CAMPAIGN',
        campaign: newCampaign,
      })
      expect(result).toEqual(newCampaign)
    })
  })
})

// --- Derived value helpers ---

describe('getProsperityLevel', () => {
  it('should return level 1 for 0 checkmarks', () => {
    expect(getProsperityLevel(0)).toBe(1)
  })

  it('should return level 2 at 4 checkmarks', () => {
    expect(getProsperityLevel(4)).toBe(2)
  })

  it('should return level 2 at 8 checkmarks', () => {
    expect(getProsperityLevel(8)).toBe(2)
  })

  it('should return level 3 at 9 checkmarks', () => {
    expect(getProsperityLevel(9)).toBe(3)
  })

  it('should return level 9 at 64 checkmarks', () => {
    expect(getProsperityLevel(64)).toBe(9)
  })

  it('should return level 9 above 64', () => {
    expect(getProsperityLevel(100)).toBe(9)
  })
})

describe('getMaxStartingLevel', () => {
  it('should return 1 for prosperity 1', () => {
    expect(getMaxStartingLevel(1)).toBe(1)
  })

  it('should return 1 for prosperity 2', () => {
    expect(getMaxStartingLevel(2)).toBe(1)
  })

  it('should return 2 for prosperity 3', () => {
    expect(getMaxStartingLevel(3)).toBe(2)
  })

  it('should return 5 for prosperity 9', () => {
    expect(getMaxStartingLevel(9)).toBe(5)
  })
})

describe('getMoraleDefenseModifier', () => {
  it('should return -10 for morale 0', () => {
    expect(getMoraleDefenseModifier(0)).toBe(-10)
  })

  it('should return -10 for morale 2', () => {
    expect(getMoraleDefenseModifier(2)).toBe(-10)
  })

  it('should return 0 for morale 9', () => {
    expect(getMoraleDefenseModifier(9)).toBe(0)
  })

  it('should return 0 for morale 11', () => {
    expect(getMoraleDefenseModifier(11)).toBe(0)
  })

  it('should return +10 for morale 20', () => {
    expect(getMoraleDefenseModifier(20)).toBe(10)
  })
})

describe('getCalendarPosition', () => {
  it('should return year 1 summer week 1 for 0 marked weeks', () => {
    expect(getCalendarPosition(0)).toEqual({
      year: 1,
      season: 'summer',
      weekInSeason: 1,
    })
  })

  it('should return year 1 summer week 10 for 9 marked weeks', () => {
    expect(getCalendarPosition(9)).toEqual({
      year: 1,
      season: 'summer',
      weekInSeason: 10,
    })
  })

  it('should return year 1 winter week 1 for 10 marked weeks', () => {
    expect(getCalendarPosition(10)).toEqual({
      year: 1,
      season: 'winter',
      weekInSeason: 1,
    })
  })

  it('should return year 2 summer week 1 for 20 marked weeks', () => {
    expect(getCalendarPosition(20)).toEqual({
      year: 2,
      season: 'summer',
      weekInSeason: 1,
    })
  })

  it('should return year 4 winter week 10 for 79 marked weeks', () => {
    expect(getCalendarPosition(79)).toEqual({
      year: 4,
      season: 'winter',
      weekInSeason: 10,
    })
  })
})
