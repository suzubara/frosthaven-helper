import { useMemo, useState } from 'react'
import type { Condition, MonsterGroup, MonsterRank, MonsterStandee } from '@/types/scenario'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { MonsterStandeeRow } from '@/features/scenario/MonsterStandeeRow'
import { getMonsterStandeeMaxHp } from '@/features/scenario/monster'

interface MonsterGroupCardProps {
  group: MonsterGroup
  onUpdateName: (name: string) => void
  onAddStandee: (standee: MonsterStandee) => void
  onUpdateStandeeHp: (standeeId: string, delta: number) => void
  onToggleStandeeCondition: (standeeId: string, condition: Condition) => void
  onKillStandee: (standeeId: string) => void
  onRemoveGroup: () => void
}

export function MonsterGroupCard({
  group,
  onUpdateName,
  onAddStandee,
  onUpdateStandeeHp,
  onToggleStandeeCondition,
  onKillStandee,
  onRemoveGroup,
}: MonsterGroupCardProps) {
  const [selectedRank, setSelectedRank] = useState<MonsterRank>('normal')

  const aliveStandees = group.standees
    .filter((s) => s.alive)
    .sort((a, b) => a.standeeNumber - b.standeeNumber)

  const deadStandees = group.standees
    .filter((s) => !s.alive)
    .sort((a, b) => a.standeeNumber - b.standeeNumber)

  const sortedStandees = [...aliveStandees, ...deadStandees]

  const nextAvailableNumber = useMemo(() => {
    const aliveNumbers = new Set(
      group.standees.filter((s) => s.alive).map((s) => s.standeeNumber),
    )
    let candidate = 1
    while (aliveNumbers.has(candidate)) {
      candidate++
    }
    return candidate
  }, [group.standees])

  const [customNumber, setCustomNumber] = useState<number | null>(null)
  const standeeNumber = customNumber ?? nextAvailableNumber

  function handleAddStandee() {
    const isElite = selectedRank === 'elite'

    onAddStandee({
      id: crypto.randomUUID(),
      standeeNumber,
      rank: selectedRank,
      currentHp: isElite ? group.maxHpElite : group.maxHpNormal,
      conditions: [],
      alive: true,
    })
    setCustomNumber(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Input
            aria-label={group.isAdHoc ? 'Enemy name' : 'Monster group name'}
            className="h-9 max-w-sm text-base font-semibold"
            value={group.name}
            onChange={(event) => onUpdateName(event.target.value)}
          />
        </CardTitle>
        <CardAction>
          <Button variant="destructive" size="sm" onClick={onRemoveGroup}>
            {group.isAdHoc ? 'Remove Enemy' : 'Remove Group'}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-1">
        {sortedStandees.map((standee) => (
          <MonsterStandeeRow
            key={standee.id}
            standee={standee}
            maxHp={getMonsterStandeeMaxHp(group, standee)}
            label={group.isAdHoc ? 'Enemy' : undefined}
            onUpdateHp={(delta) => onUpdateStandeeHp(standee.id, delta)}
            onToggleCondition={(condition) =>
              onToggleStandeeCondition(standee.id, condition)
            }
            onKill={() => onKillStandee(standee.id)}
          />
        ))}

        {!group.isAdHoc && (
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              min={1}
              aria-label="Standee number"
              className="w-16"
              value={standeeNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                setCustomNumber(Number.isNaN(val) ? null : Math.max(1, val))
              }}
            />
            <div className="flex overflow-hidden rounded-md border">
              <Button
                variant={selectedRank === 'normal' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setSelectedRank('normal')}
              >
                Normal
              </Button>
              <Button
                variant={selectedRank === 'elite' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setSelectedRank('elite')}
              >
                Elite
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStandee}
            >
              + Add Standee
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
