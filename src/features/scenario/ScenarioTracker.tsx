import { useMemo } from 'react'
import { useScenario } from '@/features/scenario/ScenarioContext'
import { RoundTracker } from '@/features/scenario/RoundTracker'
import { ElementBoard } from '@/features/scenario/ElementBoard'
import { CharacterCard } from '@/features/scenario/CharacterCard'
import { MonsterGroupCard } from '@/features/scenario/MonsterGroupCard'
import { TurnOrderPanel } from '@/features/scenario/TurnOrderPanel'
import { InitiativeInput } from '@/features/scenario/InitiativeInput'
import { getSortedTurnOrder } from '@/features/scenario/turnOrder'
import { Button } from '@/components/ui/button'
import type { MonsterGroup, MonsterStandee } from '@/types/scenario'

export function ScenarioTracker() {
  const { session, dispatch } = useScenario()

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

  function handleAddMonsterGroup() {
    const group: MonsterGroup = {
      id: crypto.randomUUID(),
      name: 'New Monster Group',
      maxHpNormal: 5,
      maxHpElite: 8,
      standees: [],
      initiative: null,
    }
    dispatch({ type: 'ADD_MONSTER_GROUP', group })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{session.name}</h1>
        <div className="flex items-center gap-4">
          <RoundTracker
            round={session.round}
            onAdvance={() => dispatch({ type: 'ADVANCE_ROUND' })}
            onRewind={() => dispatch({ type: 'REWIND_ROUND' })}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => dispatch({ type: 'END_SESSION' })}
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Turn Order */}
      <TurnOrderPanel
        turnOrder={turnOrder}
        currentTurnIndex={session.currentTurnIndex}
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

      {/* Element Board */}
      <ElementBoard
        elements={session.elements}
        onSetElement={(element, state) =>
          dispatch({ type: 'SET_ELEMENT', element, state })
        }
      />

      {/* Characters */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Characters</h2>
        <div className="flex flex-col gap-3">
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
          <Button variant="outline" size="sm" onClick={handleAddMonsterGroup}>
            + Add Group
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {session.monsterGroups.map((group) => (
            <MonsterGroupCard
              key={group.id}
              group={group}
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
