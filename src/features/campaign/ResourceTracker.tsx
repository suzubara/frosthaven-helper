import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResourceType, MaterialResource, HerbResource } from '@/types/campaign'

interface ResourceTrackerProps {
  resources: Record<ResourceType, number>
  onUpdate: (resource: ResourceType, delta: number) => void
}

const MATERIALS: { type: MaterialResource; emoji: string }[] = [
  { type: 'lumber', emoji: '🪵' },
  { type: 'metal', emoji: '⛏️' },
  { type: 'hide', emoji: '🦴' },
]

const HERBS: { type: HerbResource; emoji: string }[] = [
  { type: 'arrowvine', emoji: '🌿' },
  { type: 'axenut', emoji: '🌿' },
  { type: 'corpsecap', emoji: '🌿' },
  { type: 'flamefruit', emoji: '🌿' },
  { type: 'rockroot', emoji: '🌿' },
  { type: 'snowthistle', emoji: '🌿' },
]

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function ResourceRow({
  type,
  emoji,
  count,
  onUpdate,
}: {
  type: ResourceType
  emoji: string
  count: number
  onUpdate: (resource: ResourceType, delta: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium flex-1">
        {emoji} {capitalize(type)}
      </span>
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => onUpdate(type, -1)}
        disabled={count <= 0}
      >
        −
      </Button>
      <span className="w-8 text-center tabular-nums text-sm">{count}</span>
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => onUpdate(type, 1)}
      >
        +
      </Button>
    </div>
  )
}

export function ResourceTracker({ resources, onUpdate }: ResourceTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frosthaven Supply</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Materials
            </h3>
            {MATERIALS.map(({ type, emoji }) => (
              <ResourceRow
                key={type}
                type={type}
                emoji={emoji}
                count={resources[type]}
                onUpdate={onUpdate}
              />
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Herbs
            </h3>
            {HERBS.map(({ type, emoji }) => (
              <ResourceRow
                key={type}
                type={type}
                emoji={emoji}
                count={resources[type]}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
