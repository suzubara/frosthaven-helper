import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ElementBoard } from '@/features/scenario/ElementBoard'

const meta = {
  title: 'Scenario/ElementBoard',
  component: ElementBoard,
  args: {
    onSetElement: fn(),
  },
} satisfies Meta<typeof ElementBoard>

export default meta
type Story = StoryObj<typeof meta>

export const AllInert: Story = {
  args: {
    elements: {
      fire: 'inert',
      ice: 'inert',
      air: 'inert',
      earth: 'inert',
      light: 'inert',
      dark: 'inert',
    },
  },
}

export const MixedStates: Story = {
  args: {
    elements: {
      fire: 'strong',
      ice: 'waning',
      air: 'inert',
      earth: 'strong',
      light: 'inert',
      dark: 'waning',
    },
  },
}

export const AllStrong: Story = {
  args: {
    elements: {
      fire: 'strong',
      ice: 'strong',
      air: 'strong',
      earth: 'strong',
      light: 'strong',
      dark: 'strong',
    },
  },
}
