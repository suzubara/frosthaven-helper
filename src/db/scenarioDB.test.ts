import { describe, it, expect } from 'vitest'
import type { ScenarioSession } from '@/types/scenario'
import { saveSession, loadSession, listSessions, deleteSession } from './scenarioDB'

function makeSession(overrides: Partial<ScenarioSession> = {}): ScenarioSession {
  return {
    id: 'test-1',
    name: 'Scenario 1',
    round: 1,
    elements: {
      fire: 'inert',
      ice: 'inert',
      air: 'inert',
      earth: 'inert',
      light: 'inert',
      dark: 'inert',
    },
    characters: [],
    monsterGroups: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

describe('scenarioDB', () => {
  it('save and load a session round-trips correctly', async () => {
    const session = makeSession()
    await saveSession(session)
    const loaded = await loadSession(session.id)
    expect(loaded).toEqual(session)
  })

  it('listSessions returns all saved sessions', async () => {
    const s1 = makeSession({ id: 'list-1', name: 'First' })
    const s2 = makeSession({ id: 'list-2', name: 'Second' })
    await saveSession(s1)
    await saveSession(s2)
    const all = await listSessions()
    expect(all).toEqual(expect.arrayContaining([s1, s2]))
  })

  it('deleteSession removes a session', async () => {
    const session = makeSession({ id: 'delete-1' })
    await saveSession(session)
    await deleteSession(session.id)
    const loaded = await loadSession(session.id)
    expect(loaded).toBeUndefined()
  })

  it('loadSession returns undefined for missing id', async () => {
    const loaded = await loadSession('nonexistent')
    expect(loaded).toBeUndefined()
  })
})
