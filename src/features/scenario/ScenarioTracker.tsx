import { useMemo, useState } from 'react'
import { useScenario } from '@/features/scenario/ScenarioContext'
import { CharacterCard } from '@/features/scenario/CharacterCard'
import { MonsterGroupCard } from '@/features/scenario/MonsterGroupCard'
import { ScenarioCommandBar } from '@/features/scenario/ScenarioCommandBar'
import { InitiativeInput } from '@/features/scenario/InitiativeInput'
import { getSortedTurnOrder } from '@/features/scenario/turnOrder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MonsterGroup, MonsterStandee } from '@/types/scenario'

export function ScenarioTracker() {
  const { session, dispatch } = useScenario()
  const [addingMonsterGroup, setAddingMonsterGroup] = useState(false)
  const [newMonsterGroup, setNewMonsterGroup] = useState({
    name: '',
    maxHpNormal: '',
    maxHpElite: '',
  })

  const turnOrder = useMemo(
    () =>
      session
        ? getSortedTurnOrder(
            session.characters,
            session.monsterGroups,
            session.currentTurnIndex,
          )
        : [],
    [session],
  )

  if (!session) return null

  function handleAddMonsterGroup(event: React.FormEvent) {
    event.preventDefault()
    const name = newMonsterGroup.name.trim()
    if (!name) return

    const group: MonsterGroup = {
      id: crypto.randomUUID(),
      name,
      maxHpNormal: Number(newMonsterGroup.maxHpNormal),
      maxHpElite: Number(newMonsterGroup.maxHpElite),
      standees: [],
      initiative: null,
    }
    dispatch({ type: 'ADD_MONSTER_GROUP', group })
    resetNewMonsterGroup()
  }

  function resetNewMonsterGroup() {
    setNewMonsterGroup({ name: '', maxHpNormal: '', maxHpElite: '' })
    setAddingMonsterGroup(false)
  }

  function handleEndSession() {
    if (
      window.confirm(
        'End this session? This will permanently delete its saved tracker data.',
      )
    ) {
      dispatch({ type: 'END_SESSION' })
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-3 sm:p-4">
      {/* Scenario command bar */}
      <ScenarioCommandBar
        scenarioName={session.name}
        round={session.round}
        turnOrder={turnOrder}
        currentTurnIndex={session.currentTurnIndex}
        elements={session.elements}
        onStartRound={() => dispatch({ type: 'START_ROUND' })}
        onNextTurn={() => {
          const currentEntry = session.currentTurnIndex !== null
            ? turnOrder[session.currentTurnIndex]
            : null
          if (currentEntry) {
            dispatch({
              type: 'NEXT_TURN',
              entityId: currentEntry.id,
              entityType: currentEntry.type,
            })
          }
        }}
        onPreviousTurn={() => dispatch({ type: 'PREVIOUS_TURN' })}
        onAdvanceRound={() => dispatch({ type: 'ADVANCE_ROUND' })}
        onRewindRound={() => dispatch({ type: 'REWIND_ROUND' })}
        onSetElement={(element, state) =>
          dispatch({ type: 'SET_ELEMENT', element, state })
        }
        onEndSession={handleEndSession}
      />

      {/* Initiative Input */}
      <InitiativeInput
        characters={session.characters}
        monsterGroups={session.monsterGroups}
        onSetCharacterInitiative={(characterId, initiative) =>
          dispatch({ type: 'SET_CHARACTER_INITIATIVE', characterId, initiative })
        }
        onSetCharacterLongRest={(characterId) =>
          dispatch({ type: 'SET_CHARACTER_LONG_REST', characterId })
        }
        onClearCharacterInitiative={(characterId) =>
          dispatch({ type: 'CLEAR_CHARACTER_INITIATIVE', characterId })
        }
        onSetMonsterInitiative={(groupId, initiative) =>
          dispatch({ type: 'SET_MONSTER_INITIATIVE', groupId, initiative })
        }
        onClearMonsterInitiative={(groupId) =>
          dispatch({ type: 'CLEAR_MONSTER_INITIATIVE', groupId })
        }
      />

      {/* Characters */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Characters</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {session.characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdateHp={(delta) =>
                dispatch({
                  type: 'UPDATE_CHARACTER_HP',
                  characterId: character.id,
                  delta,
                })
              }
              onUpdateXp={(delta) =>
                dispatch({
                  type: 'UPDATE_CHARACTER_XP',
                  characterId: character.id,
                  delta,
                })
              }
              onToggleCondition={(condition) =>
                dispatch({
                  type: 'TOGGLE_CHARACTER_CONDITION',
                  characterId: character.id,
                  condition,
                })
              }
            />
          ))}
        </div>
      </section>

      {/* Monster Groups */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Monster Groups</h2>
          {!addingMonsterGroup && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingMonsterGroup(true)}
            >
              + Add Group
            </Button>
          )}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {addingMonsterGroup && (
            <Card>
              <form onSubmit={handleAddMonsterGroup}>
                <CardHeader>
                  <CardTitle>New Monster Group</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-monster-group-name">Group Name</Label>
                    <Input
                      id="new-monster-group-name"
                      autoFocus
                      required
                      value={newMonsterGroup.name}
                      onChange={(event) =>
                        setNewMonsterGroup({
                          ...newMonsterGroup,
                          name: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-monster-normal-hp">Normal HP</Label>
                      <Input
                        id="new-monster-normal-hp"
                        type="number"
                        min={1}
                        required
                        value={newMonsterGroup.maxHpNormal}
                        onChange={(event) =>
                          setNewMonsterGroup({
                            ...newMonsterGroup,
                            maxHpNormal: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="new-monster-elite-hp">Elite HP</Label>
                      <Input
                        id="new-monster-elite-hp"
                        type="number"
                        min={1}
                        required
                        value={newMonsterGroup.maxHpElite}
                        onChange={(event) =>
                          setNewMonsterGroup({
                            ...newMonsterGroup,
                            maxHpElite: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetNewMonsterGroup}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !newMonsterGroup.name.trim()
                        || Number(newMonsterGroup.maxHpNormal) < 1
                        || Number(newMonsterGroup.maxHpElite) < 1
                      }
                    >
                      Add Monster Group
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          )}
          {session.monsterGroups.map((group) => (
            <MonsterGroupCard
              key={group.id}
              group={group}
              onUpdateName={(name) =>
                dispatch({
                  type: 'UPDATE_MONSTER_GROUP_NAME',
                  groupId: group.id,
                  name,
                })
              }
              onAddStandee={(standee: MonsterStandee) =>
                dispatch({
                  type: 'ADD_STANDEE',
                  groupId: group.id,
                  standee,
                })
              }
              onUpdateStandeeHp={(standeeId: string, delta: number) =>
                dispatch({
                  type: 'UPDATE_STANDEE_HP',
                  groupId: group.id,
                  standeeId,
                  delta,
                })
              }
              onToggleStandeeCondition={(standeeId: string, condition) =>
                dispatch({
                  type: 'TOGGLE_STANDEE_CONDITION',
                  groupId: group.id,
                  standeeId,
                  condition,
                })
              }
              onKillStandee={(standeeId: string) =>
                dispatch({
                  type: 'KILL_STANDEE',
                  groupId: group.id,
                  standeeId,
                })
              }
              onRemoveGroup={() =>
                dispatch({
                  type: 'REMOVE_MONSTER_GROUP',
                  groupId: group.id,
                })
              }
            />
          ))}
        </div>
      </section>
    </div>
  )
}
