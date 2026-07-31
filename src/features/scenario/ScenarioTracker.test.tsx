import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createDefaultElements } from '@/data/elements'
import type { ScenarioSession } from '@/types/scenario'
import { ScenarioTracker } from './ScenarioTracker'

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  useScenario: vi.fn(),
}))

vi.mock('./ScenarioContext', () => ({
  useScenario: mocks.useScenario,
}))

const session: ScenarioSession = {
  id: 'test-session',
  name: 'Test Scenario',
  round: 1,
  elements: createDefaultElements(),
  characters: [],
  monsterGroups: [],
  currentTurnIndex: null,
  createdAt: 1000,
  updatedAt: 1000,
}

describe('ScenarioTracker', () => {
  beforeEach(() => {
    mocks.dispatch.mockReset()
    mocks.useScenario.mockReturnValue({ session, dispatch: mocks.dispatch })
  })

  it('keeps the session when ending is canceled', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<ScenarioTracker />)

    await user.click(screen.getByLabelText('Session actions'))
    await user.click(screen.getByRole('button', { name: 'End Session' }))

    expect(confirm).toHaveBeenCalledWith(
      'End this session? This will permanently delete its saved tracker data.',
    )
    expect(mocks.dispatch).not.toHaveBeenCalledWith({ type: 'END_SESSION' })
  })

  it('ends the session after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<ScenarioTracker />)

    await user.click(screen.getByLabelText('Session actions'))
    await user.click(screen.getByRole('button', { name: 'End Session' }))

    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'END_SESSION' })
  })

  it('starts the round from the primary command bar action', async () => {
    const user = userEvent.setup()
    render(<ScenarioTracker />)

    await user.click(screen.getByRole('button', { name: 'Start Round' }))

    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'START_ROUND' })
  })

  it('shows initiative before the round starts', () => {
    render(<ScenarioTracker />)

    expect(screen.getByText('Set Initiative')).toBeInTheDocument()
  })

  it('hides initiative after the round starts', () => {
    mocks.useScenario.mockReturnValue({
      session: { ...session, currentTurnIndex: 0 },
      dispatch: mocks.dispatch,
    })

    render(<ScenarioTracker />)

    expect(screen.queryByText('Set Initiative')).not.toBeInTheDocument()
  })

  it('advances to the next turn from the primary command bar action', async () => {
    mocks.useScenario.mockReturnValue({
      session: {
        ...session,
        characters: [
          {
            id: 'character-1',
            name: 'Banner Spear',
            maxHp: 10,
            currentHp: 10,
            xp: 0,
            conditions: [],
            initiative: 21,
            longRest: false,
          },
        ],
        currentTurnIndex: 0,
      },
      dispatch: mocks.dispatch,
    })
    const user = userEvent.setup()
    render(<ScenarioTracker />)

    await user.click(screen.getByRole('button', { name: 'Next Turn' }))

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'NEXT_TURN',
      entityId: 'character-1',
      entityType: 'character',
    })
  })

  it('advances the round when all turns are complete', async () => {
    mocks.useScenario.mockReturnValue({
      session: { ...session, currentTurnIndex: 0 },
      dispatch: mocks.dispatch,
    })
    const user = userEvent.setup()
    render(<ScenarioTracker />)

    await user.click(screen.getByRole('button', { name: 'Next Round' }))

    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'ADVANCE_ROUND' })
  })

  it('adds a monster group with the entered name and HP values', async () => {
    const user = userEvent.setup()
    render(<ScenarioTracker />)

    await user.click(screen.getByRole('button', { name: '+ Add Group' }))
    await user.type(screen.getByLabelText('Group Name'), 'Algox Guards')
    await user.type(screen.getByLabelText('Normal HP'), '8')
    await user.type(screen.getByLabelText('Elite HP'), '12')
    await user.click(screen.getByRole('button', { name: 'Add Monster Group' }))

    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'ADD_MONSTER_GROUP',
      group: {
        id: expect.any(String),
        name: 'Algox Guards',
        maxHpNormal: 8,
        maxHpElite: 12,
        standees: [],
        initiative: null,
      },
    })
  })
})
