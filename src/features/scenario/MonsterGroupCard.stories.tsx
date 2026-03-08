import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { MonsterGroupCard } from '@/features/scenario/MonsterGroupCard'

const meta = {
  title: 'Scenario/MonsterGroupCard',
  component: MonsterGroupCard,
  args: {
    onAddStandee: fn(),
    onUpdateStandeeHp: fn(),
    onToggleStandeeCondition: fn(),
    onKillStandee: fn(),
    onRemoveGroup: fn(),
  },
} satisfies Meta<typeof MonsterGroupCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    group: {
      id: '1',
      name: 'Living Bones',
      maxHpNormal: 5,
      maxHpElite: 9,
      standees: [
        {
          id: 's1',
          standeeNumber: 1,
          rank: 'normal',
          currentHp: 5,
          conditions: [],
          alive: true,
        },
        {
          id: 's2',
          standeeNumber: 2,
          rank: 'elite',
          currentHp: 5,
          conditions: ['poison'],
          alive: true,
        },
        {
          id: 's3',
          standeeNumber: 3,
          rank: 'normal',
          currentHp: 0,
          conditions: [],
          alive: false,
        },
      ],
    },
  },
}

export const EmptyGroup: Story = {
  args: {
    group: {
      id: '2',
      name: 'Frost Demons',
      maxHpNormal: 6,
      maxHpElite: 10,
      standees: [],
    },
  },
}

export const AllDead: Story = {
  args: {
    group: {
      id: '3',
      name: 'Living Spirits',
      maxHpNormal: 4,
      maxHpElite: 7,
      standees: [
        {
          id: 's1',
          standeeNumber: 1,
          rank: 'normal',
          currentHp: 0,
          conditions: [],
          alive: false,
        },
        {
          id: 's2',
          standeeNumber: 2,
          rank: 'elite',
          currentHp: 0,
          conditions: [],
          alive: false,
        },
      ],
    },
  },
}
