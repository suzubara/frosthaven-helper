import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonsterGroupCard } from './MonsterGroupCard'
import type { MonsterGroup, MonsterStandee } from '@/types/scenario'

function createTestStandee(
  overrides: Partial<MonsterStandee> = {},
): MonsterStandee {
  return {
    id: 'standee-1',
    standeeNumber: 1,
    rank: 'normal',
    currentHp: 5,
    conditions: [],
    alive: true,
    ...overrides,
  }
}

function createTestGroup(
  overrides: Partial<MonsterGroup> = {},
): MonsterGroup {
  return {
    id: 'group-1',
    name: 'Living Bones',
    maxHpNormal: 5,
    maxHpElite: 9,
    standees: [],
    initiative: null,
    ...overrides,
  }
}

function renderCard(groupOverrides: Partial<MonsterGroup> = {}) {
  const group = createTestGroup(groupOverrides)
  const onAddStandee = vi.fn()
  const onUpdateName = vi.fn()
  const result = render(
    <MonsterGroupCard
      group={group}
      onUpdateName={onUpdateName}
      onAddStandee={onAddStandee}
      onUpdateStandeeHp={vi.fn()}
      onToggleStandeeCondition={vi.fn()}
      onKillStandee={vi.fn()}
      onRemoveGroup={vi.fn()}
    />,
  )
  return { ...result, onAddStandee, onUpdateName, group }
}

describe('MonsterGroupCard', () => {
  it('updates the monster group name', async () => {
    const user = userEvent.setup()
    const { onUpdateName } = renderCard()

    await user.clear(screen.getByLabelText('Monster group name'))

    expect(onUpdateName).toHaveBeenLastCalledWith('')
  })

  describe('Bug #13: reuse eliminated enemy numbers', () => {
    it('should reuse the lowest dead standee number when adding', async () => {
      const user = userEvent.setup()
      const { onAddStandee } = renderCard({
        standees: [
          createTestStandee({ id: 's1', standeeNumber: 1, alive: true }),
          createTestStandee({ id: 's2', standeeNumber: 2, alive: false }),
          createTestStandee({ id: 's3', standeeNumber: 3, alive: true }),
        ],
      })

      await user.click(screen.getByRole('button', { name: /add standee/i }))

      expect(onAddStandee).toHaveBeenCalledOnce()
      const addedStandee = onAddStandee.mock.calls[0][0]
      expect(addedStandee.standeeNumber).toBe(2)
    })

    it('should reuse the lowest of multiple dead standee numbers', async () => {
      const user = userEvent.setup()
      const { onAddStandee } = renderCard({
        standees: [
          createTestStandee({ id: 's1', standeeNumber: 1, alive: false }),
          createTestStandee({ id: 's2', standeeNumber: 2, alive: false }),
          createTestStandee({ id: 's3', standeeNumber: 3, alive: true }),
        ],
      })

      await user.click(screen.getByRole('button', { name: /add standee/i }))

      expect(onAddStandee).toHaveBeenCalledOnce()
      const addedStandee = onAddStandee.mock.calls[0][0]
      expect(addedStandee.standeeNumber).toBe(1)
    })

    it('should increment from max when all standees are alive', async () => {
      const user = userEvent.setup()
      const { onAddStandee } = renderCard({
        standees: [
          createTestStandee({ id: 's1', standeeNumber: 1, alive: true }),
          createTestStandee({ id: 's2', standeeNumber: 2, alive: true }),
          createTestStandee({ id: 's3', standeeNumber: 3, alive: true }),
        ],
      })

      await user.click(screen.getByRole('button', { name: /add standee/i }))

      expect(onAddStandee).toHaveBeenCalledOnce()
      const addedStandee = onAddStandee.mock.calls[0][0]
      expect(addedStandee.standeeNumber).toBe(4)
    })

    it('should increment from max when there are no standees', async () => {
      const user = userEvent.setup()
      const { onAddStandee } = renderCard({ standees: [] })

      await user.click(screen.getByRole('button', { name: /add standee/i }))

      expect(onAddStandee).toHaveBeenCalledOnce()
      const addedStandee = onAddStandee.mock.calls[0][0]
      expect(addedStandee.standeeNumber).toBe(1)
    })
  })

  describe('Bug #12: create elite standees mid-game', () => {
    it('should provide a way to select Elite rank before adding', async () => {
      renderCard()

      const eliteOption = screen.getByRole('button', { name: /elite/i })
      expect(eliteOption).toBeInTheDocument()
    })

    it('should add an elite standee with maxHpElite when Elite is selected', async () => {
      const user = userEvent.setup()
      const { onAddStandee } = renderCard({
        maxHpNormal: 5,
        maxHpElite: 9,
      })

      await user.click(screen.getByRole('button', { name: /elite/i }))
      await user.click(screen.getByRole('button', { name: /add standee/i }))

      expect(onAddStandee).toHaveBeenCalledOnce()
      const addedStandee = onAddStandee.mock.calls[0][0]
      expect(addedStandee.rank).toBe('elite')
      expect(addedStandee.currentHp).toBe(9)
    })

    it('should default to normal rank with maxHpNormal', async () => {
      const user = userEvent.setup()
      const { onAddStandee } = renderCard({
        maxHpNormal: 5,
        maxHpElite: 9,
      })

      await user.click(screen.getByRole('button', { name: /add standee/i }))

      expect(onAddStandee).toHaveBeenCalledOnce()
      const addedStandee = onAddStandee.mock.calls[0][0]
      expect(addedStandee.rank).toBe('normal')
      expect(addedStandee.currentHp).toBe(5)
    })
  })

  it('renders an ad hoc enemy with its independent HP and no standee controls', () => {
    renderCard({
      name: 'Ice Wraith',
      isAdHoc: true,
      maxHpNormal: 5,
      maxHpElite: 9,
      standees: [
        createTestStandee({
          rank: 'boss',
          maxHp: 17,
          currentHp: 17,
        }),
      ],
    })

    expect(screen.getByLabelText('Enemy name')).toHaveValue('Ice Wraith')
    expect(screen.getByText('17/17')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Enemy' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add standee/i })).not.toBeInTheDocument()
  })
})
