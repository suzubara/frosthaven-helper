import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { InitiativeInput } from '@/features/scenario/InitiativeInput'
import type { CharacterState, MonsterGroup } from '@/types/scenario'

const characters: CharacterState[] = [
  { id: 'c1', name: 'Brynn', maxHp: 10, currentHp: 10, xp: 0, conditions: [], initiative: 7, longRest: false },
  { id: 'c2', name: 'Kael', maxHp: 12, currentHp: 12, xp: 0, conditions: [], initiative: 28, longRest: false },
  { id: 'c3', name: 'Mira', maxHp: 8, currentHp: 8, xp: 0, conditions: [], initiative: null, longRest: true },
]

const monsterGroups: MonsterGroup[] = [
  { id: 'g1', name: 'Living Bones', maxHpNormal: 5, maxHpElite: 9, standees: [], initiative: 12 },
  { id: 'g2', name: 'Bandit Guards', maxHpNormal: 6, maxHpElite: 10, standees: [], initiative: 45 },
  { id: 'g3', name: 'Bandit Archers', maxHpNormal: 4, maxHpElite: 7, standees: [], initiative: null },
]

const meta = {
  title: 'Scenario/InitiativeInput',
  component: InitiativeInput,
  args: {
    onSetCharacterInitiative: fn(),
    onSetCharacterLongRest: fn(),
    onClearCharacterInitiative: fn(),
    onSetMonsterInitiative: fn(),
    onClearMonsterInitiative: fn(),
  },
} satisfies Meta<typeof InitiativeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Mixed: Story = {
  args: {
    characters,
    monsterGroups,
  },
}

export const AllEmpty: Story = {
  args: {
    characters: characters.map((c) => ({ ...c, initiative: null, longRest: false })),
    monsterGroups: monsterGroups.map((g) => ({ ...g, initiative: null })),
  },
}

export const CharactersOnly: Story = {
  args: {
    characters,
    monsterGroups: [],
  },
}

export const MonstersOnly: Story = {
  args: {
    characters: [],
    monsterGroups,
  },
}
