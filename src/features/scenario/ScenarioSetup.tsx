import { useState } from 'react'
import type { MonsterRank, ScenarioSession } from '@/types/scenario'
import { createDefaultElements } from '@/data/elements'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CharacterEntry {
  name: string
  maxHp: number
}

interface StandeeEntry {
  standeeNumber: number
  rank: MonsterRank
}

interface MonsterGroupEntry {
  name: string
  maxHpNormal: number
  maxHpElite: number
  standees: StandeeEntry[]
}

interface ScenarioSetupProps {
  onStart: (session: ScenarioSession) => void
}

export function ScenarioSetup({ onStart }: ScenarioSetupProps) {
  const [scenarioName, setScenarioName] = useState('')
  const [characters, setCharacters] = useState<CharacterEntry[]>([
    { name: '', maxHp: 0 },
  ])
  const [monsterGroups, setMonsterGroups] = useState<MonsterGroupEntry[]>([])

  function addCharacter() {
    setCharacters([...characters, { name: '', maxHp: 0 }])
  }

  function removeCharacter(index: number) {
    setCharacters(characters.filter((_, i) => i !== index))
  }

  function updateCharacter(
    index: number,
    field: keyof CharacterEntry,
    value: string | number,
  ) {
    setCharacters(
      characters.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    )
  }

  function addMonsterGroup() {
    setMonsterGroups([
      ...monsterGroups,
      { name: '', maxHpNormal: 0, maxHpElite: 0, standees: [] },
    ])
  }

  function removeMonsterGroup(index: number) {
    setMonsterGroups(monsterGroups.filter((_, i) => i !== index))
  }

  function updateMonsterGroup(
    index: number,
    field: keyof Omit<MonsterGroupEntry, 'standees'>,
    value: string | number,
  ) {
    setMonsterGroups(
      monsterGroups.map((g, i) =>
        i === index ? { ...g, [field]: value } : g,
      ),
    )
  }

  function addStandee(groupIndex: number) {
    setMonsterGroups(
      monsterGroups.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              standees: [
                ...g.standees,
                { standeeNumber: g.standees.length + 1, rank: 'normal' as MonsterRank },
              ],
            }
          : g,
      ),
    )
  }

  function removeStandee(groupIndex: number, standeeIndex: number) {
    setMonsterGroups(
      monsterGroups.map((g, i) =>
        i === groupIndex
          ? { ...g, standees: g.standees.filter((_, si) => si !== standeeIndex) }
          : g,
      ),
    )
  }

  function updateStandee(
    groupIndex: number,
    standeeIndex: number,
    field: keyof StandeeEntry,
    value: number | MonsterRank,
  ) {
    setMonsterGroups(
      monsterGroups.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              standees: g.standees.map((s, si) =>
                si === standeeIndex ? { ...s, [field]: value } : s,
              ),
            }
          : g,
      ),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const now = Date.now()
    const session: ScenarioSession = {
      id: crypto.randomUUID(),
      name: scenarioName,
      round: 1,
      elements: createDefaultElements(),
      characters: characters.map((c) => ({
        id: crypto.randomUUID(),
        name: c.name,
        maxHp: c.maxHp,
        currentHp: c.maxHp,
        xp: 0,
        conditions: [],
      })),
      monsterGroups: monsterGroups.map((g) => ({
        id: crypto.randomUUID(),
        name: g.name,
        maxHpNormal: g.maxHpNormal,
        maxHpElite: g.maxHpElite,
        standees: g.standees.map((s) => ({
          id: crypto.randomUUID(),
          standeeNumber: s.standeeNumber,
          rank: s.rank,
          currentHp: s.rank === 'elite' ? g.maxHpElite : g.maxHpNormal,
          conditions: [],
          alive: true,
        })),
      })),
      createdAt: now,
      updatedAt: now,
    }

    onStart(session)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      {/* Scenario Info */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scenario-name">Scenario Name</Label>
            <Input
              id="scenario-name"
              placeholder="e.g. Scenario 1 - Roadside Ambush"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Characters */}
      <Card>
        <CardHeader>
          <CardTitle>Characters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {characters.map((char, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor={`char-name-${i}`}>Name</Label>
                <Input
                  id={`char-name-${i}`}
                  value={char.name}
                  onChange={(e) => updateCharacter(i, 'name', e.target.value)}
                />
              </div>
              <div className="flex w-24 flex-col gap-1.5">
                <Label htmlFor={`char-hp-${i}`}>Max HP</Label>
                <Input
                  id={`char-hp-${i}`}
                  type="number"
                  min={0}
                  value={char.maxHp}
                  onChange={(e) =>
                    updateCharacter(i, 'maxHp', parseInt(e.target.value) || 0)
                  }
                />
              </div>
              {characters.length > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeCharacter(i)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCharacter}>
            Add Character
          </Button>
        </CardContent>
      </Card>

      {/* Monster Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Monster Groups</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {monsterGroups.map((group, gi) => (
            <Card key={gi} size="sm">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor={`group-name-${gi}`}>Group Name</Label>
                    <Input
                      id={`group-name-${gi}`}
                      value={group.name}
                      onChange={(e) =>
                        updateMonsterGroup(gi, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex w-28 flex-col gap-1.5">
                    <Label htmlFor={`group-hp-normal-${gi}`}>Normal HP</Label>
                    <Input
                      id={`group-hp-normal-${gi}`}
                      type="number"
                      min={0}
                      value={group.maxHpNormal}
                      onChange={(e) =>
                        updateMonsterGroup(
                          gi,
                          'maxHpNormal',
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="flex w-28 flex-col gap-1.5">
                    <Label htmlFor={`group-hp-elite-${gi}`}>Elite HP</Label>
                    <Input
                      id={`group-hp-elite-${gi}`}
                      type="number"
                      min={0}
                      value={group.maxHpElite}
                      onChange={(e) =>
                        updateMonsterGroup(
                          gi,
                          'maxHpElite',
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMonsterGroup(gi)}
                  >
                    Remove
                  </Button>
                </div>

                {/* Standees */}
                <div className="flex flex-col gap-2 pl-4">
                  <Label className="text-muted-foreground">Standees</Label>
                  {group.standees.map((standee, si) => (
                    <div key={si} className="flex items-end gap-2">
                      <div className="flex w-20 flex-col gap-1.5">
                        <Label htmlFor={`standee-num-${gi}-${si}`}>#</Label>
                        <Input
                          id={`standee-num-${gi}-${si}`}
                          type="number"
                          min={1}
                          value={standee.standeeNumber}
                          onChange={(e) =>
                            updateStandee(
                              gi,
                              si,
                              'standeeNumber',
                              parseInt(e.target.value) || 1,
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`standee-rank-${gi}-${si}`}>Rank</Label>
                        <select
                          id={`standee-rank-${gi}-${si}`}
                          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          value={standee.rank}
                          onChange={(e) =>
                            updateStandee(
                              gi,
                              si,
                              'rank',
                              e.target.value as MonsterRank,
                            )
                          }
                        >
                          <option value="normal">Normal</option>
                          <option value="elite">Elite</option>
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStandee(gi, si)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStandee(gi)}
                  >
                    Add Standee
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addMonsterGroup}>
            Add Monster Group
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" size="lg">
        Start Scenario
      </Button>
    </form>
  )
}
