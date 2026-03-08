import { describe, it, expect } from 'vitest'
import { scenarioReducer, initialState } from './scenarioReducer'
import type {
  ScenarioSession,
  CharacterState,
  MonsterGroup,
  MonsterStandee,
} from '@/types/scenario'
import { createDefaultElements } from '@/data/elements'

function createTestSession(overrides: Partial<ScenarioSession> = {}): ScenarioSession {
  return {
    id: 'test-session',
    name: 'Test Scenario',
    round: 1,
    elements: createDefaultElements(),
    characters: [],
    monsterGroups: [],
    currentTurnIndex: null,
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  }
}

function createTestCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    id: 'char-1',
    name: 'Brute',
    maxHp: 10,
    currentHp: 10,
    xp: 0,
    conditions: [],
    initiative: null,
    longRest: false,
    ...overrides,
  }
}

function createTestMonsterGroup(overrides: Partial<MonsterGroup> = {}): MonsterGroup {
  return {
    id: 'group-1',
    name: 'Living Bones',
    maxHpNormal: 5,
    maxHpElite: 9,
    standees: [],
    initiative: null,
    ...overrides,
  }
}

function createTestStandee(overrides: Partial<MonsterStandee> = {}): MonsterStandee {
  return {
    id: 'standee-1',
    standeeNumber: 1,
    rank: 'normal',
    currentHp: 5,
    conditions: [],
    alive: true,
    ...overrides,
  }
}

describe('scenarioReducer', () => {
  describe('initialState', () => {
    it('should be null', () => {
      expect(initialState).toBeNull()
    })
  })

  describe('when state is null', () => {
    it('should return null for actions other than LOAD_SESSION', () => {
      const result = scenarioReducer(null, { type: 'ADVANCE_ROUND' })
      expect(result).toBeNull()
    })

    it('should handle LOAD_SESSION', () => {
      const session = createTestSession()
      const result = scenarioReducer(null, { type: 'LOAD_SESSION', session })
      expect(result).toEqual(session)
    })
  })

  describe('ADVANCE_ROUND', () => {
    it('should increment round', () => {
      const state = createTestSession({ round: 1 })
      const result = scenarioReducer(state, { type: 'ADVANCE_ROUND' })
      expect(result?.round).toBe(2)
    })

    it('should auto-decay elements: strong → waning', () => {
      const state = createTestSession({
        elements: { ...createDefaultElements(), fire: 'strong' },
      })
      const result = scenarioReducer(state, { type: 'ADVANCE_ROUND' })
      expect(result?.elements.fire).toBe('waning')
    })

    it('should auto-decay elements: waning → inert', () => {
      const state = createTestSession({
        elements: { ...createDefaultElements(), ice: 'waning' },
      })
      const result = scenarioReducer(state, { type: 'ADVANCE_ROUND' })
      expect(result?.elements.ice).toBe('inert')
    })

    it('should leave inert elements as inert', () => {
      const state = createTestSession()
      const result = scenarioReducer(state, { type: 'ADVANCE_ROUND' })
      expect(result?.elements.fire).toBe('inert')
    })
  })

  describe('REWIND_ROUND', () => {
    it('should decrement round', () => {
      const state = createTestSession({ round: 3 })
      const result = scenarioReducer(state, { type: 'REWIND_ROUND' })
      expect(result?.round).toBe(2)
    })

    it('should not go below 1', () => {
      const state = createTestSession({ round: 1 })
      const result = scenarioReducer(state, { type: 'REWIND_ROUND' })
      expect(result?.round).toBe(1)
    })
  })

  describe('SET_ELEMENT', () => {
    it('should set a specific element state', () => {
      const state = createTestSession()
      const result = scenarioReducer(state, {
        type: 'SET_ELEMENT',
        element: 'fire',
        state: 'strong',
      })
      expect(result?.elements.fire).toBe('strong')
      expect(result?.elements.ice).toBe('inert')
    })
  })

  describe('DECAY_ELEMENTS', () => {
    it('should decay strong to waning and waning to inert', () => {
      const state = createTestSession({
        elements: {
          ...createDefaultElements(),
          fire: 'strong',
          ice: 'waning',
          air: 'inert',
        },
      })
      const result = scenarioReducer(state, { type: 'DECAY_ELEMENTS' })
      expect(result?.elements.fire).toBe('waning')
      expect(result?.elements.ice).toBe('inert')
      expect(result?.elements.air).toBe('inert')
    })
  })

  describe('ADD_CHARACTER', () => {
    it('should add a character', () => {
      const state = createTestSession()
      const character = createTestCharacter()
      const result = scenarioReducer(state, { type: 'ADD_CHARACTER', character })
      expect(result?.characters).toHaveLength(1)
      expect(result?.characters[0]).toEqual(character)
    })
  })

  describe('REMOVE_CHARACTER', () => {
    it('should remove a character by id', () => {
      const character = createTestCharacter()
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'REMOVE_CHARACTER',
        characterId: 'char-1',
      })
      expect(result?.characters).toHaveLength(0)
    })

    it('should not remove other characters', () => {
      const char1 = createTestCharacter({ id: 'char-1' })
      const char2 = createTestCharacter({ id: 'char-2', name: 'Spellweaver' })
      const state = createTestSession({ characters: [char1, char2] })
      const result = scenarioReducer(state, {
        type: 'REMOVE_CHARACTER',
        characterId: 'char-1',
      })
      expect(result?.characters).toHaveLength(1)
      expect(result?.characters[0].id).toBe('char-2')
    })
  })

  describe('UPDATE_CHARACTER_HP', () => {
    it('should increase HP', () => {
      const character = createTestCharacter({ currentHp: 5 })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_CHARACTER_HP',
        characterId: 'char-1',
        delta: 3,
      })
      expect(result?.characters[0].currentHp).toBe(8)
    })

    it('should clamp HP at maxHp', () => {
      const character = createTestCharacter({ currentHp: 9, maxHp: 10 })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_CHARACTER_HP',
        characterId: 'char-1',
        delta: 5,
      })
      expect(result?.characters[0].currentHp).toBe(10)
    })

    it('should clamp HP at 0', () => {
      const character = createTestCharacter({ currentHp: 3 })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_CHARACTER_HP',
        characterId: 'char-1',
        delta: -10,
      })
      expect(result?.characters[0].currentHp).toBe(0)
    })
  })

  describe('UPDATE_CHARACTER_XP', () => {
    it('should increase XP', () => {
      const character = createTestCharacter({ xp: 5 })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_CHARACTER_XP',
        characterId: 'char-1',
        delta: 3,
      })
      expect(result?.characters[0].xp).toBe(8)
    })

    it('should not go below 0', () => {
      const character = createTestCharacter({ xp: 2 })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_CHARACTER_XP',
        characterId: 'char-1',
        delta: -5,
      })
      expect(result?.characters[0].xp).toBe(0)
    })
  })

  describe('TOGGLE_CHARACTER_CONDITION', () => {
    it('should add a condition when not present', () => {
      const character = createTestCharacter()
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'TOGGLE_CHARACTER_CONDITION',
        characterId: 'char-1',
        condition: 'poison',
      })
      expect(result?.characters[0].conditions).toContain('poison')
    })

    it('should remove a condition when present', () => {
      const character = createTestCharacter({ conditions: ['poison', 'stun'] })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'TOGGLE_CHARACTER_CONDITION',
        characterId: 'char-1',
        condition: 'poison',
      })
      expect(result?.characters[0].conditions).not.toContain('poison')
      expect(result?.characters[0].conditions).toContain('stun')
    })
  })

  describe('ADD_MONSTER_GROUP', () => {
    it('should add a monster group', () => {
      const state = createTestSession()
      const group = createTestMonsterGroup()
      const result = scenarioReducer(state, { type: 'ADD_MONSTER_GROUP', group })
      expect(result?.monsterGroups).toHaveLength(1)
      expect(result?.monsterGroups[0]).toEqual(group)
    })
  })

  describe('REMOVE_MONSTER_GROUP', () => {
    it('should remove a monster group by id', () => {
      const group = createTestMonsterGroup()
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'REMOVE_MONSTER_GROUP',
        groupId: 'group-1',
      })
      expect(result?.monsterGroups).toHaveLength(0)
    })
  })

  describe('ADD_STANDEE', () => {
    it('should add a standee to a group', () => {
      const group = createTestMonsterGroup()
      const state = createTestSession({ monsterGroups: [group] })
      const standee = createTestStandee()
      const result = scenarioReducer(state, {
        type: 'ADD_STANDEE',
        groupId: 'group-1',
        standee,
      })
      expect(result?.monsterGroups[0].standees).toHaveLength(1)
      expect(result?.monsterGroups[0].standees[0]).toEqual(standee)
    })
  })

  describe('UPDATE_STANDEE_HP', () => {
    it('should update standee HP', () => {
      const standee = createTestStandee({ currentHp: 3 })
      const group = createTestMonsterGroup({ standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_STANDEE_HP',
        groupId: 'group-1',
        standeeId: 'standee-1',
        delta: 1,
      })
      expect(result?.monsterGroups[0].standees[0].currentHp).toBe(4)
    })

    it('should clamp normal standee HP at maxHpNormal', () => {
      const standee = createTestStandee({ currentHp: 4, rank: 'normal' })
      const group = createTestMonsterGroup({ maxHpNormal: 5, standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_STANDEE_HP',
        groupId: 'group-1',
        standeeId: 'standee-1',
        delta: 5,
      })
      expect(result?.monsterGroups[0].standees[0].currentHp).toBe(5)
    })

    it('should clamp elite standee HP at maxHpElite', () => {
      const standee = createTestStandee({ currentHp: 8, rank: 'elite' })
      const group = createTestMonsterGroup({ maxHpElite: 9, standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_STANDEE_HP',
        groupId: 'group-1',
        standeeId: 'standee-1',
        delta: 5,
      })
      expect(result?.monsterGroups[0].standees[0].currentHp).toBe(9)
    })

    it('should clamp standee HP at 0', () => {
      const standee = createTestStandee({ currentHp: 2 })
      const group = createTestMonsterGroup({ standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'UPDATE_STANDEE_HP',
        groupId: 'group-1',
        standeeId: 'standee-1',
        delta: -10,
      })
      expect(result?.monsterGroups[0].standees[0].currentHp).toBe(0)
    })
  })

  describe('TOGGLE_STANDEE_CONDITION', () => {
    it('should add a condition to a standee', () => {
      const standee = createTestStandee()
      const group = createTestMonsterGroup({ standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'TOGGLE_STANDEE_CONDITION',
        groupId: 'group-1',
        standeeId: 'standee-1',
        condition: 'muddle',
      })
      expect(result?.monsterGroups[0].standees[0].conditions).toContain('muddle')
    })

    it('should remove a condition from a standee', () => {
      const standee = createTestStandee({ conditions: ['muddle'] })
      const group = createTestMonsterGroup({ standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'TOGGLE_STANDEE_CONDITION',
        groupId: 'group-1',
        standeeId: 'standee-1',
        condition: 'muddle',
      })
      expect(result?.monsterGroups[0].standees[0].conditions).not.toContain('muddle')
    })
  })

  describe('KILL_STANDEE', () => {
    it('should set alive to false', () => {
      const standee = createTestStandee()
      const group = createTestMonsterGroup({ standees: [standee] })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'KILL_STANDEE',
        groupId: 'group-1',
        standeeId: 'standee-1',
      })
      expect(result?.monsterGroups[0].standees[0].alive).toBe(false)
    })
  })

  describe('LOAD_SESSION', () => {
    it('should replace the entire state', () => {
      const oldState = createTestSession({ round: 5 })
      const newSession = createTestSession({ round: 1, name: 'New Scenario' })
      const result = scenarioReducer(oldState, {
        type: 'LOAD_SESSION',
        session: newSession,
      })
      expect(result).toEqual(newSession)
    })
  })

  describe('END_SESSION', () => {
    it('should return null', () => {
      const state = createTestSession()
      const result = scenarioReducer(state, { type: 'END_SESSION' })
      expect(result).toBeNull()
    })
  })

  describe('SET_CHARACTER_INITIATIVE', () => {
    it('should set initiative for a character', () => {
      const character = createTestCharacter()
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'SET_CHARACTER_INITIATIVE',
        characterId: 'char-1',
        initiative: 15,
      })
      expect(result?.characters[0].initiative).toBe(15)
    })

    it('should clear longRest when setting initiative', () => {
      const character = createTestCharacter({ longRest: true })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'SET_CHARACTER_INITIATIVE',
        characterId: 'char-1',
        initiative: 15,
      })
      expect(result?.characters[0].longRest).toBe(false)
    })
  })

  describe('SET_CHARACTER_LONG_REST', () => {
    it('should set longRest to true and initiative to null', () => {
      const character = createTestCharacter({ initiative: 15 })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'SET_CHARACTER_LONG_REST',
        characterId: 'char-1',
      })
      expect(result?.characters[0].longRest).toBe(true)
      expect(result?.characters[0].initiative).toBeNull()
    })
  })

  describe('CLEAR_CHARACTER_INITIATIVE', () => {
    it('should reset initiative and longRest', () => {
      const character = createTestCharacter({ initiative: 15, longRest: true })
      const state = createTestSession({ characters: [character] })
      const result = scenarioReducer(state, {
        type: 'CLEAR_CHARACTER_INITIATIVE',
        characterId: 'char-1',
      })
      expect(result?.characters[0].initiative).toBeNull()
      expect(result?.characters[0].longRest).toBe(false)
    })
  })

  describe('SET_MONSTER_INITIATIVE', () => {
    it('should set initiative for a monster group', () => {
      const group = createTestMonsterGroup()
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'SET_MONSTER_INITIATIVE',
        groupId: 'group-1',
        initiative: 42,
      })
      expect(result?.monsterGroups[0].initiative).toBe(42)
    })
  })

  describe('CLEAR_MONSTER_INITIATIVE', () => {
    it('should clear initiative for a monster group', () => {
      const group = createTestMonsterGroup({ initiative: 42 })
      const state = createTestSession({ monsterGroups: [group] })
      const result = scenarioReducer(state, {
        type: 'CLEAR_MONSTER_INITIATIVE',
        groupId: 'group-1',
      })
      expect(result?.monsterGroups[0].initiative).toBeNull()
    })
  })

  describe('START_ROUND', () => {
    it('should set currentTurnIndex to 0', () => {
      const state = createTestSession()
      const result = scenarioReducer(state, { type: 'START_ROUND' })
      expect(result?.currentTurnIndex).toBe(0)
    })
  })

  describe('NEXT_TURN', () => {
    it('should increment currentTurnIndex', () => {
      const state = createTestSession({ currentTurnIndex: 0 })
      const result = scenarioReducer(state, { type: 'NEXT_TURN' })
      expect(result?.currentTurnIndex).toBe(1)
    })

    it('should go from null to 0', () => {
      const state = createTestSession({ currentTurnIndex: null })
      const result = scenarioReducer(state, { type: 'NEXT_TURN' })
      expect(result?.currentTurnIndex).toBe(0)
    })
  })

  describe('PREVIOUS_TURN', () => {
    it('should decrement currentTurnIndex', () => {
      const state = createTestSession({ currentTurnIndex: 2 })
      const result = scenarioReducer(state, { type: 'PREVIOUS_TURN' })
      expect(result?.currentTurnIndex).toBe(1)
    })

    it('should not go below 0', () => {
      const state = createTestSession({ currentTurnIndex: 0 })
      const result = scenarioReducer(state, { type: 'PREVIOUS_TURN' })
      expect(result?.currentTurnIndex).toBe(0)
    })
  })

  describe('ADVANCE_ROUND (initiative reset)', () => {
    it('should reset all initiative values and currentTurnIndex', () => {
      const char = createTestCharacter({ initiative: 15, longRest: true })
      const group = createTestMonsterGroup({ initiative: 42 })
      const state = createTestSession({
        characters: [char],
        monsterGroups: [group],
        currentTurnIndex: 3,
      })
      const result = scenarioReducer(state, { type: 'ADVANCE_ROUND' })
      expect(result?.characters[0].initiative).toBeNull()
      expect(result?.characters[0].longRest).toBe(false)
      expect(result?.monsterGroups[0].initiative).toBeNull()
      expect(result?.currentTurnIndex).toBeNull()
    })
  })
})
