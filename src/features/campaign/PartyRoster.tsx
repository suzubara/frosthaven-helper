import { useState } from 'react'
import type { PartyCharacter } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PartyRosterProps {
  party: PartyCharacter[]
  onAdd: (character: PartyCharacter) => void
  onRemove: (characterId: string) => void
  onUpdate: (
    characterId: string,
    updates: Partial<Pick<PartyCharacter, 'name' | 'className' | 'level' | 'maxHp'>>
  ) => void
  onRetire: (characterId: string) => void
}

const emptyForm = { name: '', className: '', level: 1, maxHp: 1 }

export function PartyRoster({
  party,
  onAdd,
  onRemove,
  onUpdate,
  onRetire,
}: PartyRosterProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = addForm.name.trim()
    const trimmedClass = addForm.className.trim()
    if (!trimmedName || !trimmedClass) return

    onAdd({
      id: crypto.randomUUID(),
      name: trimmedName,
      className: trimmedClass,
      level: addForm.level,
      maxHp: addForm.maxHp,
      retired: false,
    })
    setAddForm(emptyForm)
    setShowAddForm(false)
  }

  function startEditing(character: PartyCharacter) {
    setEditingId(character.id)
    setEditForm({
      name: character.name,
      className: character.className,
      level: character.level,
      maxHp: character.maxHp,
    })
  }

  function handleSaveEdit(characterId: string) {
    const trimmedName = editForm.name.trim()
    const trimmedClass = editForm.className.trim()
    if (!trimmedName || !trimmedClass) return

    onUpdate(characterId, {
      name: trimmedName,
      className: trimmedClass,
      level: editForm.level,
      maxHp: editForm.maxHp,
    })
    setEditingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Party Roster</CardTitle>
        <CardAction>
          <Button
            size="sm"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            Add Character
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <form onSubmit={handleAdd} className="space-y-3 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="add-name">Name</Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Character name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-class">Class</Label>
                <Input
                  id="add-class"
                  value={addForm.className}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, className: e.target.value }))
                  }
                  placeholder="Class name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-level">Level</Label>
                <Input
                  id="add-level"
                  type="number"
                  min={1}
                  value={addForm.level}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      level: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-hp">Max HP</Label>
                <Input
                  id="add-hp"
                  type="number"
                  min={1}
                  value={addForm.maxHp}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      maxHp: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setAddForm(emptyForm)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {party.length === 0 ? (
          <p className="text-muted-foreground">
            No characters in the roster yet
          </p>
        ) : (
          <ul className="space-y-2">
            {party.map((character) => (
              <li
                key={character.id}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border p-4',
                  character.retired && 'opacity-60'
                )}
              >
                {editingId === character.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`edit-name-${character.id}`}>Name</Label>
                        <Input
                          id={`edit-name-${character.id}`}
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-class-${character.id}`}>
                          Class
                        </Label>
                        <Input
                          id={`edit-class-${character.id}`}
                          value={editForm.className}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              className: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-level-${character.id}`}>
                          Level
                        </Label>
                        <Input
                          id={`edit-level-${character.id}`}
                          type="number"
                          min={1}
                          value={editForm.level}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              level: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-hp-${character.id}`}>Max HP</Label>
                        <Input
                          id={`edit-hp-${character.id}`}
                          type="number"
                          min={1}
                          value={editForm.maxHp}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              maxHp: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(character.id)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{character.name}</span>
                      <span className="text-muted-foreground">
                        {character.className}
                      </span>
                      <span className="text-muted-foreground">
                        Level {character.level}
                      </span>
                      <span className="text-muted-foreground">
                        HP {character.maxHp}
                      </span>
                      {character.retired && (
                        <Badge variant="secondary">🏛 Retired</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!character.retired && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(character)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRetire(character.id)}
                          >
                            Retire
                          </Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemove(character.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
