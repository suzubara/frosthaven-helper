import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ElementBoard } from '@/features/scenario/ElementBoard'
import { cn } from '@/lib/utils'
import type { TurnOrderEntry } from '@/features/scenario/turnOrder'
import type { ElementName, ElementState } from '@/types/scenario'

interface ScenarioCommandBarProps {
  scenarioName: string
  round: number
  turnOrder: TurnOrderEntry[]
  currentTurnIndex: number | null
  elements: Record<ElementName, ElementState>
  onStartRound: () => void
  onNextTurn: () => void
  onPreviousTurn: () => void
  onAdvanceRound: () => void
  onRewindRound: () => void
  onSetElement: (element: ElementName, state: ElementState) => void
  onEndSession: () => void
}

export function ScenarioCommandBar({
  scenarioName,
  round,
  turnOrder,
  currentTurnIndex,
  elements,
  onStartRound,
  onNextTurn,
  onPreviousTurn,
  onAdvanceRound,
  onRewindRound,
  onSetElement,
  onEndSession,
}: ScenarioCommandBarProps) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const roundStarted = currentTurnIndex !== null
  const allTurnsComplete = roundStarted && currentTurnIndex >= turnOrder.length
  const currentEntry = roundStarted && !allTurnsComplete
    ? turnOrder[currentTurnIndex]
    : null

  const status = !roundStarted
    ? 'Round not started'
    : allTurnsComplete
      ? 'Round complete'
      : currentEntry
        ? `${currentEntry.initiative ?? '--'} · ${currentEntry.name}`
        : 'No active figure'

  function handlePrimaryAction() {
    if (!roundStarted) {
      onStartRound()
    } else if (allTurnsComplete) {
      onAdvanceRound()
    } else {
      onNextTurn()
    }
  }

  function closeActions() {
    setActionsOpen(false)
  }

  return (
    <Card className="sticky top-0 z-20 gap-3 overflow-visible bg-card/95 py-3 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-xl font-bold">{scenarioName}</h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Round {round}</span>
              <span aria-hidden="true"> · </span>
              {status}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xl"
              onClick={onPreviousTurn}
              disabled={!roundStarted || currentTurnIndex === 0}
            >
              Previous
            </Button>
            <Button size="xl" onClick={handlePrimaryAction}>
              {!roundStarted
                ? 'Start Round'
                : allTurnsComplete
                  ? 'Next Round'
                  : 'Next Turn'}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="icon-xl"
                aria-label="Session actions"
                aria-expanded={actionsOpen}
                onClick={() => setActionsOpen((open) => !open)}
              >
                •••
              </Button>
              {actionsOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 flex min-w-44 flex-col gap-1 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="justify-start"
                    onClick={() => {
                      closeActions()
                      onRewindRound()
                    }}
                    disabled={round <= 1}
                  >
                    Rewind Round
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="justify-start"
                    onClick={() => {
                      closeActions()
                      onAdvanceRound()
                    }}
                  >
                    Advance Round
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="justify-start"
                    onClick={() => {
                      closeActions()
                      onEndSession()
                    }}
                  >
                    End Session
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {turnOrder.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add figures and set initiative to build the turn order.
              </p>
            ) : (
              turnOrder.map((entry, index) => {
                const isCurrent = roundStarted && index === currentTurnIndex
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex h-11 max-w-44 shrink-0 items-center gap-2 rounded-lg border bg-background px-3 text-sm',
                      isCurrent && 'border-primary bg-primary/10 ring-2 ring-primary/30',
                      entry.hasActed && 'text-muted-foreground opacity-60',
                    )}
                  >
                    <span aria-hidden="true">
                      {entry.hasActed ? '✓' : isCurrent ? '▶' : '○'}
                    </span>
                    <span className="font-mono font-semibold tabular-nums">
                      {entry.initiative !== null
                        ? String(entry.initiative).padStart(2, '0')
                        : '--'}
                    </span>
                    <span className="truncate font-medium">{entry.name}</span>
                    {entry.longRest && <span title="Long rest">💤</span>}
                  </div>
                )
              })
            )}
          </div>

          <div className="shrink-0 border-t pt-2 md:border-l md:border-t-0 md:pl-3 md:pt-0">
            <ElementBoard
              compact
              elements={elements}
              onSetElement={onSetElement}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
