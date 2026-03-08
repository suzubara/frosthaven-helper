import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TurnOrderPanel } from '@/features/scenario/TurnOrderPanel'
import type { TurnOrderEntry } from '@/features/scenario/turnOrder'

const sampleEntries: TurnOrderEntry[] = [
  { id: '1', name: 'Brynn', type: 'character', initiative: 7, longRest: false, hasActed: false },
  { id: '2', name: 'Living Bones', type: 'monster', initiative: 12, longRest: false, hasActed: false },
  { id: '3', name: 'Kael', type: 'character', initiative: 28, longRest: false, hasActed: false },
  { id: '4', name: 'Bandit Guards', type: 'monster', initiative: 45, longRest: false, hasActed: false },
  { id: '5', name: 'Mira', type: 'character', initiative: 99, longRest: true, hasActed: false },
  { id: '6', name: 'Bandit Archers', type: 'monster', initiative: null, longRest: false, hasActed: false },
]

const meta = {
  title: 'Scenario/TurnOrderPanel',
  component: TurnOrderPanel,
  args: {
    onStartRound: fn(),
    onNextTurn: fn(),
    onPreviousTurn: fn(),
    onAdvanceRound: fn(),
  },
} satisfies Meta<typeof TurnOrderPanel>

export default meta
type Story = StoryObj<typeof meta>

export const BeforeRoundStart: Story = {
  args: {
    turnOrder: sampleEntries,
    currentTurnIndex: null,
  },
}

export const MidRound: Story = {
  args: {
    turnOrder: sampleEntries.map((e, i) => ({
      ...e,
      hasActed: i < 2,
    })),
    currentTurnIndex: 2,
  },
}

export const AllTurnsComplete: Story = {
  args: {
    turnOrder: sampleEntries.map((e) => ({
      ...e,
      hasActed: true,
    })),
    currentTurnIndex: sampleEntries.length,
  },
}

export const Empty: Story = {
  args: {
    turnOrder: [],
    currentTurnIndex: null,
  },
}

export const FirstTurn: Story = {
  args: {
    turnOrder: sampleEntries,
    currentTurnIndex: 0,
  },
}
