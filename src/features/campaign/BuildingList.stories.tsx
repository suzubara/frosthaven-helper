import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { BuildingList } from '@/features/campaign/BuildingList'

const meta = {
  title: 'Campaign/BuildingList',
  component: BuildingList,
  args: {
    onAdd: fn(),
    onRemove: fn(),
    onUpgrade: fn(),
    onWreck: fn(),
    onRebuild: fn(),
  },
} satisfies Meta<typeof BuildingList>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    buildings: [],
  },
}

export const WithBuildings: Story = {
  args: {
    buildings: [
      { id: '1', name: 'Craftsman', level: 1, status: 'unlocked' },
      { id: '2', name: 'Alchemist', level: 2, status: 'unlocked' },
      { id: '3', name: 'Barracks', level: 1, status: 'unlocked' },
      { id: '4', name: 'Logging Camp', level: 1, status: 'wrecked' },
      { id: '5', name: 'Mining Camp', level: 0, status: 'unlocked' },
    ],
  },
}

export const AllWrecked: Story = {
  args: {
    buildings: [
      { id: '1', name: 'Craftsman', level: 2, status: 'wrecked' },
      { id: '2', name: 'Barracks', level: 1, status: 'wrecked' },
    ],
  },
}
