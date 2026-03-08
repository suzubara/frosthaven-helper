import { describe, it, expect } from 'vitest'
import { getSortedTurnOrder } from './turnOrder'
import type { CharacterState, MonsterGroup } from '@/types/scenario'

function createChar(overrides: Partial<CharacterState> = {}): CharacterState {
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

function createMonster(overrides: Partial<MonsterGroup> = {}): MonsterGroup {
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

describe('getSortedTurnOrder', () => {
  it('should sort by initiative ascending', () => {
    const chars = [
      createChar({ id: 'c1', name: 'Brynn', initiative: 28 }),
      createChar({ id: 'c2', name: 'Kael', initiative: 7 }),
    ]
    const result = getSortedTurnOrder(chars, [], null)
    expect(result.map((e) => e.name)).toEqual(['Kael', 'Brynn'])
  })

  it('should put null initiative at the end', () => {
    const chars = [
      createChar({ id: 'c1', name: 'Brynn', initiative: null }),
      createChar({ id: 'c2', name: 'Kael', initiative: 15 }),
    ]
    const result = getSortedTurnOrder(chars, [], null)
    expect(result.map((e) => e.name)).toEqual(['Kael', 'Brynn'])
  })

  it('should sort characters before monsters on initiative tie', () => {
    const chars = [createChar({ id: 'c1', name: 'Brynn', initiative: 20 })]
    const monsters = [createMonster({ id: 'g1', name: 'Bones', initiative: 20 })]
    const result = getSortedTurnOrder(chars, monsters, null)
    expect(result.map((e) => e.name)).toEqual(['Brynn', 'Bones'])
  })

  it('should treat long rest characters as initiative 99', () => {
    const chars = [
      createChar({ id: 'c1', name: 'Brynn', initiative: 50 }),
      createChar({ id: 'c2', name: 'Mira', longRest: true }),
    ]
    const result = getSortedTurnOrder(chars, [], null)
    expect(result.map((e) => e.name)).toEqual(['Brynn', 'Mira'])
    expect(result[1].initiative).toBe(99)
    expect(result[1].longRest).toBe(true)
  })

  it('should mix characters and monsters correctly', () => {
    const chars = [
      createChar({ id: 'c1', name: 'Brynn', initiative: 28 }),
      createChar({ id: 'c2', name: 'Kael', initiative: 7 }),
    ]
    const monsters = [
      createMonster({ id: 'g1', name: 'Living Bones', initiative: 12 }),
      createMonster({ id: 'g2', name: 'Bandit Guards', initiative: 45 }),
    ]
    const result = getSortedTurnOrder(chars, monsters, null)
    expect(result.map((e) => e.name)).toEqual([
      'Kael',
      'Living Bones',
      'Brynn',
      'Bandit Guards',
    ])
  })

  it('should set hasActed based on currentTurnIndex', () => {
    const chars = [
      createChar({ id: 'c1', name: 'Brynn', initiative: 10 }),
      createChar({ id: 'c2', name: 'Kael', initiative: 20 }),
      createChar({ id: 'c3', name: 'Mira', initiative: 30 }),
    ]
    const result = getSortedTurnOrder(chars, [], 2)
    expect(result[0].hasActed).toBe(true)
    expect(result[1].hasActed).toBe(true)
    expect(result[2].hasActed).toBe(false)
  })

  it('should not set hasActed when currentTurnIndex is null', () => {
    const chars = [
      createChar({ id: 'c1', name: 'Brynn', initiative: 10 }),
    ]
    const result = getSortedTurnOrder(chars, [], null)
    expect(result[0].hasActed).toBe(false)
  })

  it('should handle empty lists', () => {
    const result = getSortedTurnOrder([], [], null)
    expect(result).toEqual([])
  })

  it('should keep null-initiative figures in stable order among themselves', () => {
    const chars = [createChar({ id: 'c1', name: 'Brynn', initiative: null })]
    const monsters = [createMonster({ id: 'g1', name: 'Bones', initiative: null })]
    const result = getSortedTurnOrder(chars, monsters, null)
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.initiative === null)).toBe(true)
  })
})
