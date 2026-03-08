import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TurnOrderEntry } from '@/features/scenario/turnOrder'

interface TurnOrderPanelProps {
  turnOrder: TurnOrderEntry[]
  currentTurnIndex: number | null
  onStartRound: () => void
  onNextTurn: () => void
  onPreviousTurn: () => void
}

export function TurnOrderPanel({
  turnOrder,
  currentTurnIndex,
  onStartRound,
  onNextTurn,
  onPreviousTurn,
}: TurnOrderPanelProps) {
  const roundStarted = currentTurnIndex !== null
  const allTurnsComplete = roundStarted && currentTurnIndex >= turnOrder.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            ⚔️ Turn Order
          </CardTitle>
          {!roundStarted && (
            <Button size="sm" onClick={onStartRound}>
              Start Round
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {turnOrder.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No figures in the scenario yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {turnOrder.map((entry, index) => {
              const isCurrent = roundStarted && index === currentTurnIndex
              const hasActed = entry.hasActed

              return (
                <li
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                    isCurrent && 'bg-primary/10 ring-2 ring-primary/30',
                    hasActed && 'text-muted-foreground opacity-60',
                    !isCurrent && !hasActed && 'bg-muted/30',
                  )}
                >
                  <span className="w-5 text-center">
                    {hasActed ? '✅' : isCurrent ? '▶️' : '○'}
                  </span>
                  <span className="w-8 text-right font-mono font-medium tabular-nums">
                    {entry.initiative !== null
                      ? String(entry.initiative).padStart(2, '0')
                      : '--'}
                  </span>
                  <span className="flex-1 font-medium">{entry.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {entry.type === 'character' ? 'character' : 'monster'}
                  </Badge>
                  {entry.longRest && (
                    <span title="Long rest">💤</span>
                  )}
                </li>
              )
            })}
          </ol>
        )}

        {roundStarted && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousTurn}
              disabled={currentTurnIndex === 0}
            >
              ◀ Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextTurn}
              disabled={allTurnsComplete}
            >
              Next ▶
            </Button>
            {allTurnsComplete && (
              <span className="text-muted-foreground ml-2 text-sm">
                All turns complete — advance to next round
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
