import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getMoraleDefenseModifier,
  getMaxStartingLevel,
  getProsperityLevel,
} from '@/features/campaign/campaignReducer'

interface OutpostStatsProps {
  morale: number
  prosperityCheckmarks: number
  totalDefense: number
  soldiers: number
  barracksMaxSoldiers: number
  inspiration: number
  onUpdateMorale: (delta: number) => void
  onUpdateProsperity: (delta: number) => void
  onUpdateDefense: (delta: number) => void
  onUpdateSoldiers: (delta: number) => void
  onUpdateInspiration: (delta: number) => void
}

export function OutpostStats({
  morale,
  prosperityCheckmarks,
  totalDefense,
  soldiers,
  barracksMaxSoldiers,
  inspiration,
  onUpdateMorale,
  onUpdateProsperity,
  onUpdateDefense,
  onUpdateSoldiers,
  onUpdateInspiration,
}: OutpostStatsProps) {
  const moraleDefMod = getMoraleDefenseModifier(morale)
  const prosperityLevel = getProsperityLevel(prosperityCheckmarks)
  const maxCharLevel = getMaxStartingLevel(prosperityLevel)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outpost Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Morale</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateMorale(-1)}>
                −
              </Button>
              <span className="text-sm font-medium tabular-nums">{morale}</span>
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateMorale(1)}>
                +
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Defense mod: {moraleDefMod >= 0 ? `+${moraleDefMod}` : moraleDefMod}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Prosperity</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateProsperity(-1)}>
                −
              </Button>
              <span className="text-sm font-medium tabular-nums">
                {prosperityCheckmarks}
              </span>
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateProsperity(1)}>
                +
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Level {prosperityLevel} · Max char level: {maxCharLevel}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Defense</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateDefense(-1)}>
                −
              </Button>
              <span className="text-sm font-medium tabular-nums">{totalDefense}</span>
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateDefense(1)}>
                +
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Effective: {totalDefense + moraleDefMod}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Soldiers</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateSoldiers(-1)}>
                −
              </Button>
              <span className="text-sm font-medium tabular-nums">{soldiers}</span>
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateSoldiers(1)}>
                +
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Max: {barracksMaxSoldiers}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Inspiration</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateInspiration(-1)}>
                −
              </Button>
              <span className="text-sm font-medium tabular-nums">{inspiration}</span>
              <Button variant="outline" size="icon-xs" onClick={() => onUpdateInspiration(1)}>
                +
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
