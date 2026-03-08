import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PartyRoster } from '@/features/campaign/PartyRoster'

const meta = {
  title: 'Campaign/PartyRoster',
  component: PartyRoster,
  args: {
    onAdd: fn(),
    onRemove: fn(),
    onUpdate: fn(),
    onRetire: fn(),
  },
} satisfies Meta<typeof PartyRoster>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    party: [],
  },
}

export const ActiveParty: Story = {
  args: {
    party: [
      {
        id: '1',
        name: 'Brynn',
        className: 'Banner Spear',
        level: 3,
        maxHp: 12,
        retired: false,
      },
      {
        id: '2',
        name: 'Kael',
        className: 'Drifter',
        level: 2,
        maxHp: 10,
        retired: false,
      },
    ],
  },
}

export const WithRetired: Story = {
  args: {
    party: [
      {
        id: '1',
        name: 'Brynn',
        className: 'Banner Spear',
        level: 5,
        maxHp: 14,
        retired: false,
      },
      {
        id: '2',
        name: 'Old Gregor',
        className: 'Boneshaper',
        level: 4,
        maxHp: 8,
        retired: true,
      },
      {
        id: '3',
        name: 'Kael',
        className: 'Drifter',
        level: 2,
        maxHp: 10,
        retired: false,
      },
    ],
  },
}

export const FullRoster: Story = {
  args: {
    party: [
      { id: '1', name: 'Brynn', className: 'Banner Spear', level: 5, maxHp: 14, retired: false },
      { id: '2', name: 'Kael', className: 'Drifter', level: 4, maxHp: 12, retired: false },
      { id: '3', name: 'Vala', className: 'Deathwalker', level: 3, maxHp: 8, retired: false },
      { id: '4', name: 'Theron', className: 'Blinkblade', level: 3, maxHp: 10, retired: false },
      { id: '5', name: 'Old Gregor', className: 'Boneshaper', level: 4, maxHp: 8, retired: true },
      { id: '6', name: 'Sera', className: 'Geminate', level: 2, maxHp: 10, retired: true },
    ],
  },
}
