import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ResourceTracker } from '@/features/campaign/ResourceTracker'

const meta = {
  title: 'Campaign/ResourceTracker',
  component: ResourceTracker,
  args: {
    onUpdate: fn(),
  },
} satisfies Meta<typeof ResourceTracker>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    resources: {
      lumber: 0,
      metal: 0,
      hide: 0,
      arrowvine: 0,
      axenut: 0,
      corpsecap: 0,
      flamefruit: 0,
      rockroot: 0,
      snowthistle: 0,
    },
  },
}

export const MidGame: Story = {
  args: {
    resources: {
      lumber: 5,
      metal: 3,
      hide: 4,
      arrowvine: 2,
      axenut: 1,
      corpsecap: 0,
      flamefruit: 3,
      rockroot: 1,
      snowthistle: 2,
    },
  },
}

export const Stocked: Story = {
  args: {
    resources: {
      lumber: 15,
      metal: 12,
      hide: 10,
      arrowvine: 8,
      axenut: 6,
      corpsecap: 4,
      flamefruit: 7,
      rockroot: 5,
      snowthistle: 3,
    },
  },
}
