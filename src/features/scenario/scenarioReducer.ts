import type {
  CharacterState,
  Condition,
  ElementName,
  ElementState,
  MonsterGroup,
  MonsterStandee,
  ScenarioSession,
} from '@/types/scenario'

export type ScenarioAction =
  | { type: 'ADVANCE_ROUND' }
  | { type: 'REWIND_ROUND' }
  | { type: 'SET_ELEMENT'; element: ElementName; state: ElementState }
  | { type: 'DECAY_ELEMENTS' }
  | { type: 'ADD_CHARACTER'; character: CharacterState }
  | { type: 'REMOVE_CHARACTER'; characterId: string }
  | { type: 'UPDATE_CHARACTER_HP'; characterId: string; delta: number }
  | { type: 'UPDATE_CHARACTER_XP'; characterId: string; delta: number }
  | { type: 'TOGGLE_CHARACTER_CONDITION'; characterId: string; condition: Condition }
  | { type: 'ADD_MONSTER_GROUP'; group: MonsterGroup }
  | { type: 'REMOVE_MONSTER_GROUP'; groupId: string }
  | { type: 'ADD_STANDEE'; groupId: string; standee: MonsterStandee }
  | { type: 'UPDATE_STANDEE_HP'; groupId: string; standeeId: string; delta: number }
  | { type: 'TOGGLE_STANDEE_CONDITION'; groupId: string; standeeId: string; condition: Condition }
  | { type: 'KILL_STANDEE'; groupId: string; standeeId: string }
  | { type: 'LOAD_SESSION'; session: ScenarioSession }
  | { type: 'END_SESSION' }
  | { type: 'SET_CHARACTER_INITIATIVE'; characterId: string; initiative: number }
  | { type: 'SET_CHARACTER_LONG_REST'; characterId: string }
  | { type: 'CLEAR_CHARACTER_INITIATIVE'; characterId: string }
  | { type: 'SET_MONSTER_INITIATIVE'; groupId: string; initiative: number }
  | { type: 'CLEAR_MONSTER_INITIATIVE'; groupId: string }
  | { type: 'START_ROUND' }
  | { type: 'NEXT_TURN' }
  | { type: 'PREVIOUS_TURN' }

export const initialState: ScenarioSession | null = null

function decayElements(
  elements: Record<ElementName, ElementState>,
): Record<ElementName, ElementState> {
  const result = { ...elements }
  for (const key of Object.keys(result) as ElementName[]) {
    if (result[key] === 'strong') {
      result[key] = 'waning'
    } else if (result[key] === 'waning') {
      result[key] = 'inert'
    }
  }
  return result
}

function updateCharacter(
  characters: CharacterState[],
  characterId: string,
  updater: (c: CharacterState) => CharacterState,
): CharacterState[] {
  return characters.map((c) => (c.id === characterId ? updater(c) : c))
}

function updateMonsterGroup(
  groups: MonsterGroup[],
  groupId: string,
  updater: (g: MonsterGroup) => MonsterGroup,
): MonsterGroup[] {
  return groups.map((g) => (g.id === groupId ? updater(g) : g))
}

function updateStandee(
  standees: MonsterStandee[],
  standeeId: string,
  updater: (s: MonsterStandee) => MonsterStandee,
): MonsterStandee[] {
  return standees.map((s) => (s.id === standeeId ? updater(s) : s))
}

function getStandeeMaxHp(group: MonsterGroup, standee: MonsterStandee): number {
  return standee.rank === 'elite' ? group.maxHpElite : group.maxHpNormal
}

export function scenarioReducer(
  state: ScenarioSession | null,
  action: ScenarioAction,
): ScenarioSession | null {
  if (action.type === 'LOAD_SESSION') {
    return action.session
  }

  if (action.type === 'END_SESSION') {
    return null
  }

  if (state === null) {
    return state
  }

  switch (action.type) {
    case 'ADVANCE_ROUND':
      return {
        ...state,
        round: state.round + 1,
        elements: decayElements(state.elements),
        characters: state.characters.map((c) => ({
          ...c,
          initiative: null,
          longRest: false,
        })),
        monsterGroups: state.monsterGroups.map((g) => ({
          ...g,
          initiative: null,
        })),
        currentTurnIndex: null,
      }

    case 'REWIND_ROUND':
      return {
        ...state,
        round: Math.max(1, state.round - 1),
      }

    case 'SET_ELEMENT':
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.element]: action.state,
        },
      }

    case 'DECAY_ELEMENTS':
      return {
        ...state,
        elements: decayElements(state.elements),
      }

    case 'ADD_CHARACTER':
      return {
        ...state,
        characters: [...state.characters, action.character],
      }

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.characterId),
      }

    case 'UPDATE_CHARACTER_HP':
      return {
        ...state,
        characters: updateCharacter(state.characters, action.characterId, (c) => ({
          ...c,
          currentHp: Math.max(0, Math.min(c.maxHp, c.currentHp + action.delta)),
        })),
      }

    case 'UPDATE_CHARACTER_XP':
      return {
        ...state,
        characters: updateCharacter(state.characters, action.characterId, (c) => ({
          ...c,
          xp: Math.max(0, c.xp + action.delta),
        })),
      }

    case 'TOGGLE_CHARACTER_CONDITION':
      return {
        ...state,
        characters: updateCharacter(state.characters, action.characterId, (c) => ({
          ...c,
          conditions: c.conditions.includes(action.condition)
            ? c.conditions.filter((cond) => cond !== action.condition)
            : [...c.conditions, action.condition],
        })),
      }

    case 'ADD_MONSTER_GROUP':
      return {
        ...state,
        monsterGroups: [...state.monsterGroups, action.group],
      }

    case 'REMOVE_MONSTER_GROUP':
      return {
        ...state,
        monsterGroups: state.monsterGroups.filter((g) => g.id !== action.groupId),
      }

    case 'ADD_STANDEE':
      return {
        ...state,
        monsterGroups: updateMonsterGroup(state.monsterGroups, action.groupId, (g) => ({
          ...g,
          standees: [...g.standees, action.standee],
        })),
      }

    case 'UPDATE_STANDEE_HP':
      return {
        ...state,
        monsterGroups: updateMonsterGroup(state.monsterGroups, action.groupId, (g) => ({
          ...g,
          standees: updateStandee(g.standees, action.standeeId, (s) => {
            const maxHp = getStandeeMaxHp(g, s)
            return {
              ...s,
              currentHp: Math.max(0, Math.min(maxHp, s.currentHp + action.delta)),
            }
          }),
        })),
      }

    case 'TOGGLE_STANDEE_CONDITION':
      return {
        ...state,
        monsterGroups: updateMonsterGroup(state.monsterGroups, action.groupId, (g) => ({
          ...g,
          standees: updateStandee(g.standees, action.standeeId, (s) => ({
            ...s,
            conditions: s.conditions.includes(action.condition)
              ? s.conditions.filter((cond) => cond !== action.condition)
              : [...s.conditions, action.condition],
          })),
        })),
      }

    case 'KILL_STANDEE':
      return {
        ...state,
        monsterGroups: updateMonsterGroup(state.monsterGroups, action.groupId, (g) => ({
          ...g,
          standees: updateStandee(g.standees, action.standeeId, (s) => ({
            ...s,
            alive: false,
          })),
        })),
      }

    case 'SET_CHARACTER_INITIATIVE':
      return {
        ...state,
        characters: updateCharacter(state.characters, action.characterId, (c) => ({
          ...c,
          initiative: action.initiative,
          longRest: false,
        })),
      }

    case 'SET_CHARACTER_LONG_REST':
      return {
        ...state,
        characters: updateCharacter(state.characters, action.characterId, (c) => ({
          ...c,
          initiative: null,
          longRest: true,
        })),
      }

    case 'CLEAR_CHARACTER_INITIATIVE':
      return {
        ...state,
        characters: updateCharacter(state.characters, action.characterId, (c) => ({
          ...c,
          initiative: null,
          longRest: false,
        })),
      }

    case 'SET_MONSTER_INITIATIVE':
      return {
        ...state,
        monsterGroups: updateMonsterGroup(state.monsterGroups, action.groupId, (g) => ({
          ...g,
          initiative: action.initiative,
        })),
      }

    case 'CLEAR_MONSTER_INITIATIVE':
      return {
        ...state,
        monsterGroups: updateMonsterGroup(state.monsterGroups, action.groupId, (g) => ({
          ...g,
          initiative: null,
        })),
      }

    case 'START_ROUND':
      return {
        ...state,
        currentTurnIndex: 0,
      }

    case 'NEXT_TURN':
      return {
        ...state,
        currentTurnIndex: (state.currentTurnIndex ?? -1) + 1,
      }

    case 'PREVIOUS_TURN':
      return {
        ...state,
        currentTurnIndex: Math.max(0, (state.currentTurnIndex ?? 0) - 1),
      }

    default:
      return state
  }
}
