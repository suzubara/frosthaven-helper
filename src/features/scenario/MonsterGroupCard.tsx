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

interface MonsterGroupCardProps {
  group: MonsterGroup
  onAddStandee: (standee: MonsterStandee) => void
  onUpdateStandeeHp: (standeeId: string, delta: number) => void
  onToggleStandeeCondition: (standeeId: string, condition: Condition) => void
  onKillStandee: (standeeId: string) => void
  onRemoveGroup: () => void
}

export function MonsterGroupCard({
  group,
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
        <CardTitle>{group.name}</CardTitle>
        <CardAction>
          <Button variant="destructive" size="sm" onClick={onRemoveGroup}>
            Remove Group
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-1">
        {sortedStandees.map((standee) => (
          <MonsterStandeeRow
            key={standee.id}
            standee={standee}
            maxHp={
              standee.rank === 'elite'
                ? group.maxHpElite
                : group.maxHpNormal
            }
            onUpdateHp={(delta) => onUpdateStandeeHp(standee.id, delta)}
            onToggleCondition={(condition) =>
              onToggleStandeeCondition(standee.id, condition)
            }
            onKill={() => onKillStandee(standee.id)}
          />
        ))}

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
      </CardContent>
    </Card>
  )
}
