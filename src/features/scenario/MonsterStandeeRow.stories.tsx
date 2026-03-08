import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { MonsterStandeeRow } from '@/features/scenario/MonsterStandeeRow'

const meta = {
  title: 'Scenario/MonsterStandeeRow',
  component: MonsterStandeeRow,
  args: {
    onUpdateHp: fn(),
    onToggleCondition: fn(),
    onKill: fn(),
  },
} satisfies Meta<typeof MonsterStandeeRow>

export default meta
type Story = StoryObj<typeof meta>

export const NormalAlive: Story = {
  args: {
    standee: {
      id: '1',
      standeeNumber: 1,
      rank: 'normal',
      currentHp: 4,
      conditions: [],
      alive: true,
    },
    maxHp: 5,
  },
}

export const EliteAlive: Story = {
  args: {
    standee: {
      id: '2',
      standeeNumber: 2,
      rank: 'elite',
      currentHp: 7,
      conditions: ['poison'],
      alive: true,
    },
    maxHp: 9,
  },
}

export const Dead: Story = {
  args: {
    standee: {
      id: '3',
      standeeNumber: 3,
      rank: 'normal',
      currentHp: 0,
      conditions: [],
      alive: false,
    },
    maxHp: 5,
  },
}

export const LowHp: Story = {
  args: {
    standee: {
      id: '4',
      standeeNumber: 4,
      rank: 'normal',
      currentHp: 1,
      conditions: ['wound', 'muddle'],
      alive: true,
    },
    maxHp: 8,
  },
}
