import type { Condition, MonsterStandee } from '@/types/scenario'
import { ALL_CONDITIONS } from '@/data/conditions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MonsterStandeeRowProps {
  standee: MonsterStandee
  maxHp: number
  onUpdateHp: (delta: number) => void
  onToggleCondition: (condition: Condition) => void
  onKill: () => void
}

const RANK_LABEL: Record<MonsterStandee['rank'], string> = {
  normal: 'N',
  elite: 'E',
  boss: 'B',
}

export function MonsterStandeeRow({
  standee,
  maxHp,
  onUpdateHp,
  onToggleCondition,
  onKill,
}: MonsterStandeeRowProps) {
  if (!standee.alive) {
    return (
      <div className="flex items-center gap-2 opacity-40 py-1">
        <span className="font-mono text-sm">#{standee.standeeNumber}</span>
        <span>💀 dead</span>
      </div>
    )
  }

  const isElite = standee.rank === 'elite'

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <Badge
        variant="default"
        className={cn(
          'font-mono',
          isElite && 'border-yellow-500 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
        )}
      >
        #{standee.standeeNumber} ({RANK_LABEL[standee.rank]})
      </Badge>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onUpdateHp(-1)}
          disabled={standee.currentHp <= 0}
        >
          −
        </Button>
        <span className="min-w-[3ch] text-center text-sm font-medium tabular-nums">
          {standee.currentHp}/{maxHp}
        </span>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onUpdateHp(1)}
          disabled={standee.currentHp >= maxHp}
        >
          +
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {ALL_CONDITIONS.map((condition) => {
          const active = standee.conditions.includes(condition)
          return (
            <Badge
              key={condition}
              variant={active ? 'default' : 'outline'}
              className="cursor-pointer select-none text-[0.65rem]"
              onClick={() => onToggleCondition(condition)}
            >
              {condition}
            </Badge>
          )
        })}
      </div>

      <Button variant="ghost" size="sm" onClick={onKill}>
        ☠️
      </Button>
    </div>
  )
}
