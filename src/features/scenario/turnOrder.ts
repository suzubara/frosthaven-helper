import type { CharacterState, MonsterGroup } from '@/types/scenario'

export interface TurnOrderEntry {
  id: string
  name: string
  type: 'character' | 'monster'
  initiative: number | null
  longRest: boolean
  hasActed: boolean
}

export function getSortedTurnOrder(
  characters: CharacterState[],
  monsterGroups: MonsterGroup[],
  currentTurnIndex: number | null,
): TurnOrderEntry[] {
  const entries: TurnOrderEntry[] = [
    ...characters.map((c) => ({
      id: c.id,
      name: c.name,
      type: 'character' as const,
      initiative: c.longRest ? 99 : c.initiative,
      longRest: c.longRest,
      hasActed: false,
    })),
    ...monsterGroups.map((g) => ({
      id: g.id,
      name: g.name,
      type: 'monster' as const,
      initiative: g.initiative,
      longRest: false,
      hasActed: false,
    })),
  ]

  entries.sort((a, b) => {
    if (a.initiative === null && b.initiative === null) return 0
    if (a.initiative === null) return 1
    if (b.initiative === null) return -1

    if (a.initiative !== b.initiative) return a.initiative - b.initiative

    if (a.type !== b.type) return a.type === 'character' ? -1 : 1

    return 0
  })

  if (currentTurnIndex !== null) {
    for (let i = 0; i < entries.length; i++) {
      entries[i].hasActed = i < currentTurnIndex
    }
  }

  return entries
}
