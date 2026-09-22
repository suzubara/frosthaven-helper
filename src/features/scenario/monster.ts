import type { MonsterGroup, MonsterStandee } from '@/types/scenario'

export function getMonsterStandeeMaxHp(
  group: MonsterGroup,
  standee: MonsterStandee,
): number {
  if (standee.maxHp !== undefined) return standee.maxHp
  return standee.rank === 'elite' ? group.maxHpElite : group.maxHpNormal
}

export function createAdHocEnemy(name: string, maxHp: number): MonsterGroup {
  return {
    id: crypto.randomUUID(),
    name,
    maxHpNormal: maxHp,
    maxHpElite: maxHp,
    initiative: null,
    isAdHoc: true,
    standees: [
      {
        id: crypto.randomUUID(),
        standeeNumber: 1,
        rank: 'boss',
        maxHp,
        currentHp: maxHp,
        conditions: [],
        alive: true,
      },
    ],
  }
}
