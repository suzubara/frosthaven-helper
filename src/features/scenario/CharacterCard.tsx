import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ALL_CONDITIONS } from '@/data/conditions'
import type { CharacterState, Condition } from '@/types/scenario'
import { cn } from '@/lib/utils'

interface CharacterCardProps {
  character: CharacterState
  onUpdateHp: (delta: number) => void
  onUpdateXp: (delta: number) => void
  onToggleCondition: (condition: Condition) => void
}

export function CharacterCard({
  character,
  onUpdateHp,
  onUpdateXp,
  onToggleCondition,
}: CharacterCardProps) {
  const isExhausted = character.currentHp === 0
  const isLowHp =
    !isExhausted && character.currentHp <= character.maxHp * 0.25

  return (
    <Card
      className={cn(
        isExhausted && 'opacity-60 ring-2 ring-destructive',
      )}
    >
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        {isExhausted && (
          <span className="text-xs font-semibold text-destructive">
            EXHAUSTED
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">HP:</span>
          <Button variant="outline" size="icon-xs" onClick={() => onUpdateHp(-1)}>
            −
          </Button>
          <span
            className={cn(
              'text-sm font-medium tabular-nums',
              isExhausted && 'text-destructive',
              isLowHp && 'text-amber-500',
            )}
          >
            {character.currentHp}/{character.maxHp}
          </span>
          <Button variant="outline" size="icon-xs" onClick={() => onUpdateHp(1)}>
            +
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">XP:</span>
          <Button variant="outline" size="icon-xs" onClick={() => onUpdateXp(-1)}>
            −
          </Button>
          <span className="text-sm font-medium tabular-nums">
            {character.xp}
          </span>
          <Button variant="outline" size="icon-xs" onClick={() => onUpdateXp(1)}>
            +
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {ALL_CONDITIONS.map((condition) => {
            const isActive = character.conditions.includes(condition)
            return (
              <Badge
                key={condition}
                variant={isActive ? 'default' : 'outline'}
                className="cursor-pointer select-none capitalize"
                onClick={() => onToggleCondition(condition)}
              >
                {condition}
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
