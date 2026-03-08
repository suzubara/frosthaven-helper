import { useState } from 'react'
import type { Building } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface BuildingListProps {
  buildings: Building[]
  onAdd: (building: Building) => void
  onRemove: (buildingId: string) => void
  onUpgrade: (buildingId: string) => void
  onWreck: (buildingId: string) => void
  onRebuild: (buildingId: string) => void
}

function getStatusBadge(building: Building) {
  if (building.status === 'wrecked') {
    return <Badge variant="destructive">💥 Wrecked</Badge>
  }
  if (building.status === 'locked') {
    return <Badge variant="outline">🔒 Locked</Badge>
  }
  if (building.level > 0) {
    return <Badge variant="default">✅ Active</Badge>
  }
  return <Badge variant="secondary">🔓 Unlocked</Badge>
}

export function BuildingList({
  buildings,
  onAdd,
  onRemove,
  onUpgrade,
  onWreck,
  onRebuild,
}: BuildingListProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({
      id: crypto.randomUUID(),
      name: trimmed,
      level: 0,
      status: 'unlocked',
    })
    setName('')
    setShowForm(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buildings</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            Add Building
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              placeholder="Building name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button size="sm" type="submit">
              Add
            </Button>
          </form>
        )}

        {buildings.length === 0 ? (
          <p className="text-muted-foreground">No buildings yet</p>
        ) : (
          buildings.map((building) => (
            <div
              key={building.id}
              className="flex items-center justify-between gap-2 rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{building.name}</span>
                <span className="text-muted-foreground text-sm">
                  {building.level === 0 ? 'L0' : `Level ${building.level}`}
                </span>
                {getStatusBadge(building)}
              </div>

              <div className="flex items-center gap-1">
                {building.status === 'unlocked' && building.level === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpgrade(building.id)}
                  >
                    Build
                  </Button>
                )}

                {building.status === 'unlocked' && building.level > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpgrade(building.id)}
                    >
                      Upgrade
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onWreck(building.id)}
                    >
                      Wreck
                    </Button>
                  </>
                )}

                {building.status === 'wrecked' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRebuild(building.id)}
                  >
                    Rebuild
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(building.id)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
