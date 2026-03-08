import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { OutpostStats } from '@/features/campaign/OutpostStats'

const meta = {
  title: 'Campaign/OutpostStats',
  component: OutpostStats,
  args: {
    onUpdateMorale: fn(),
    onUpdateProsperity: fn(),
    onUpdateDefense: fn(),
    onUpdateSoldiers: fn(),
    onUpdateInspiration: fn(),
  },
} satisfies Meta<typeof OutpostStats>

export default meta
type Story = StoryObj<typeof meta>

export const EarlyGame: Story = {
  args: {
    morale: 3,
    prosperityCheckmarks: 2,
    totalDefense: 0,
    soldiers: 0,
    barracksMaxSoldiers: 0,
    inspiration: 0,
  },
}

export const MidGame: Story = {
  args: {
    morale: 8,
    prosperityCheckmarks: 12,
    totalDefense: 3,
    soldiers: 2,
    barracksMaxSoldiers: 4,
    inspiration: 5,
  },
}

export const LateGame: Story = {
  args: {
    morale: 16,
    prosperityCheckmarks: 45,
    totalDefense: 8,
    soldiers: 4,
    barracksMaxSoldiers: 6,
    inspiration: 12,
  },
}

export const LowMorale: Story = {
  args: {
    morale: 1,
    prosperityCheckmarks: 20,
    totalDefense: -3,
    soldiers: 1,
    barracksMaxSoldiers: 4,
    inspiration: 2,
  },
}
