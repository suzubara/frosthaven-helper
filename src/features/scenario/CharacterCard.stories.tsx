import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CharacterCard } from '@/features/scenario/CharacterCard'

const meta = {
  title: 'Scenario/CharacterCard',
  component: CharacterCard,
  args: {
    onUpdateHp: fn(),
    onUpdateXp: fn(),
    onToggleCondition: fn(),
  },
} satisfies Meta<typeof CharacterCard>

export default meta
type Story = StoryObj<typeof meta>

export const FullHealth: Story = {
  args: {
    character: {
      id: '1',
      name: 'Brynn',
      maxHp: 10,
      currentHp: 10,
      xp: 0,
      conditions: [],
    },
  },
}

export const LowHp: Story = {
  args: {
    character: {
      id: '2',
      name: 'Kael',
      maxHp: 12,
      currentHp: 2,
      xp: 4,
      conditions: ['poison'],
    },
  },
}

export const Exhausted: Story = {
  args: {
    character: {
      id: '3',
      name: 'Vala',
      maxHp: 8,
      currentHp: 0,
      xp: 7,
      conditions: ['wound', 'muddle'],
    },
  },
}

export const ManyConditions: Story = {
  args: {
    character: {
      id: '4',
      name: 'Theron',
      maxHp: 14,
      currentHp: 10,
      xp: 3,
      conditions: ['poison', 'wound', 'stun', 'strengthen', 'invisible'],
    },
  },
}
