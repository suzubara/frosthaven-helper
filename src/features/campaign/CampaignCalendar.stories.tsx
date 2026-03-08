import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CampaignCalendar } from '@/features/campaign/CampaignCalendar'
import type { CalendarWeek } from '@/types/campaign'

function createCalendar(
  markedCount: number,
  sections: Record<number, string[]> = {},
): CalendarWeek[] {
  return Array.from({ length: 80 }, (_, i) => ({
    marked: i < markedCount,
    sections: sections[i] ?? [],
  }))
}

const meta = {
  title: 'Campaign/CampaignCalendar',
  component: CampaignCalendar,
  args: {
    onMarkWeek: fn(),
    onUnmarkWeek: fn(),
    onAddSection: fn(),
    onRemoveSection: fn(),
  },
} satisfies Meta<typeof CampaignCalendar>

export default meta
type Story = StoryObj<typeof meta>

export const NotStarted: Story = {
  args: {
    calendar: createCalendar(0),
  },
}

export const EarlyGame: Story = {
  args: {
    calendar: createCalendar(6),
  },
}

export const MidGame: Story = {
  args: {
    calendar: createCalendar(25, {
      8: ['42'],
      15: ['107'],
      22: ['53', '88'],
    }),
  },
}

export const LateGame: Story = {
  args: {
    calendar: createCalendar(65, {
      5: ['12'],
      20: ['42'],
      40: ['77'],
      55: ['103', '115'],
    }),
  },
}

export const Complete: Story = {
  args: {
    calendar: createCalendar(80),
  },
}
