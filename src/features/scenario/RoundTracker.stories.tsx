import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { RoundTracker } from '@/features/scenario/RoundTracker'

const meta = {
  title: 'Scenario/RoundTracker',
  component: RoundTracker,
  args: {
    onAdvance: fn(),
    onRewind: fn(),
  },
} satisfies Meta<typeof RoundTracker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    round: 1,
  },
}

export const MidGame: Story = {
  args: {
    round: 5,
  },
}

export const LateGame: Story = {
  args: {
    round: 12,
  },
}
