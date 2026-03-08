import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CampaignNotes } from '@/features/campaign/CampaignNotes'

const meta = {
  title: 'Campaign/CampaignNotes',
  component: CampaignNotes,
  args: {
    onAddSticker: fn(),
    onRemoveSticker: fn(),
    onUpdateNotes: fn(),
  },
} satisfies Meta<typeof CampaignNotes>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    stickers: [],
    notes: '',
  },
}

export const WithStickers: Story = {
  args: {
    stickers: ['Ancient Technology', 'Into the Forest', 'Merchant Guild'],
    notes: '',
  },
}

export const WithNotes: Story = {
  args: {
    stickers: ['Ancient Technology'],
    notes: 'Completed scenario 42. Unlocked new building: Enhancer.\nNeed to buy leather armor next visit to Craftsman.\n\nReminder: Read section 107 after next outpost phase.',
  },
}
