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

    await user.click(screen.getByRole('button', { name: 'End Session' }))

    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'END_SESSION' })
  })
})
