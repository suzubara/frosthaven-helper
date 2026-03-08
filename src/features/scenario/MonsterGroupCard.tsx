import type { Condition, MonsterGroup, MonsterStandee } from '@/types/scenario'
import { Button } from '@/components/ui/button'
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
  const aliveStandees = group.standees
    .filter((s) => s.alive)
    .sort((a, b) => a.standeeNumber - b.standeeNumber)

  const deadStandees = group.standees
    .filter((s) => !s.alive)
    .sort((a, b) => a.standeeNumber - b.standeeNumber)

  const sortedStandees = [...aliveStandees, ...deadStandees]

  function handleAddStandee() {
    const maxNumber = group.standees.reduce(
      (max, s) => Math.max(max, s.standeeNumber),
      0,
    )

    onAddStandee({
      id: crypto.randomUUID(),
      standeeNumber: maxNumber + 1,
      rank: 'normal',
      currentHp: group.maxHpNormal,
      conditions: [],
      alive: true,
    })
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

        <Button
          variant="outline"
          size="sm"
          className="mt-2 self-start"
          onClick={handleAddStandee}
        >
          + Add Standee
        </Button>
      </CardContent>
    </Card>
  )
}
