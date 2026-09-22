import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAdHocEnemy } from '@/features/scenario/monster'
import type { MonsterGroup } from '@/types/scenario'

interface AdHocEnemyFormProps {
  onAdd: (enemy: MonsterGroup) => void
  onCancel?: () => void
}

export function AdHocEnemyForm({ onAdd, onCancel }: AdHocEnemyFormProps) {
  const [name, setName] = useState('')
  const [maxHp, setMaxHp] = useState('')

  function handleAdd() {
    const trimmedName = name.trim()
    const parsedMaxHp = Number(maxHp)
    if (!trimmedName || parsedMaxHp < 1) return

    onAdd(createAdHocEnemy(trimmedName, parsedMaxHp))
    setName('')
    setMaxHp('')
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    handleAdd()
  }

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ad-hoc-enemy-name">Enemy Name</Label>
          <Input
            id="ad-hoc-enemy-name"
            autoFocus={onCancel !== undefined}
            placeholder="e.g. Frozen Corpse"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ad-hoc-enemy-hp">Enemy Max HP</Label>
          <Input
            id="ad-hoc-enemy-hp"
            type="number"
            min={1}
            value={maxHp}
            onChange={(event) => setMaxHp(event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          disabled={!name.trim() || Number(maxHp) < 1}
          onClick={handleAdd}
        >
          Add Enemy
        </Button>
      </div>
    </div>
  )
}
