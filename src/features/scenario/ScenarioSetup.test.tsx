import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScenarioSetup } from './ScenarioSetup'

it('includes ad hoc enemies when starting a scenario', async () => {
  const onStart = vi.fn()
  const user = userEvent.setup()
  render(<ScenarioSetup onStart={onStart} />)

  await user.type(screen.getByLabelText('Enemy Name'), 'Scenario Boss')
  await user.type(screen.getByLabelText('Enemy Max HP'), '25')
  await user.click(screen.getByRole('button', { name: 'Add Enemy' }))
  await user.click(screen.getByRole('button', { name: 'Start Scenario' }))

  expect(onStart).toHaveBeenCalledOnce()
  expect(onStart.mock.calls[0][0].monsterGroups).toContainEqual({
    id: expect.any(String),
    name: 'Scenario Boss',
    maxHpNormal: 25,
    maxHpElite: 25,
    initiative: null,
    isAdHoc: true,
    standees: [
      {
        id: expect.any(String),
        standeeNumber: 1,
        rank: 'boss',
        maxHp: 25,
        currentHp: 25,
        conditions: [],
        alive: true,
      },
    ],
  })
})
