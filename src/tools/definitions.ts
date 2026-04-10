export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // --- Campaign management ---
  {
    name: 'list_campaigns',
    description: 'List all saved campaigns',
    parameters: {},
  },
  {
    name: 'create_campaign',
    description: 'Create a new campaign with default values and load it',
    parameters: {
      name: { type: 'string', description: 'Campaign name' },
    },
  },
  {
    name: 'load_campaign',
    description: 'Load an existing campaign by name',
    parameters: {
      name: { type: 'string', description: 'Campaign name' },
    },
  },
  {
    name: 'get_campaign_status',
    description: 'Get a full summary of the current campaign (resources, morale, prosperity, defense, soldiers, buildings, party, calendar)',
    parameters: {},
  },
  {
    name: 'update_resource',
    description: 'Add or remove a resource. Use negative delta to subtract.',
    parameters: {
      resource: {
        type: 'string',
        enum: ['lumber', 'metal', 'hide', 'arrowvine', 'axenut', 'corpsecap', 'flamefruit', 'rockroot', 'snowthistle'],
        description: 'Resource type',
      },
      delta: { type: 'number', description: 'Amount to add (negative to subtract)' },
    },
  },
  {
    name: 'update_morale',
    description: 'Adjust campaign morale (range 0–20)',
    parameters: {
      delta: { type: 'number', description: 'Amount to add (negative to subtract)' },
    },
  },
  {
    name: 'update_prosperity',
    description: 'Add or remove prosperity checkmarks',
    parameters: {
      delta: { type: 'number', description: 'Checkmarks to add (negative to subtract)' },
    },
  },
  {
    name: 'update_defense',
    description: 'Adjust total defense value',
    parameters: {
      delta: { type: 'number', description: 'Amount to add (negative to subtract)' },
    },
  },
  {
    name: 'update_soldiers',
    description: 'Adjust soldier count (clamped to barracks max)',
    parameters: {
      delta: { type: 'number', description: 'Amount to add (negative to subtract)' },
    },
  },
  {
    name: 'update_inspiration',
    description: 'Adjust inspiration value',
    parameters: {
      delta: { type: 'number', description: 'Amount to add (negative to subtract)' },
    },
  },
  {
    name: 'mark_week',
    description: 'Mark the next unmarked week on the campaign calendar',
    parameters: {},
  },
  {
    name: 'add_building',
    description: 'Add/build/unlock a new building in the outpost (Craftsman, Alchemist, Barracks, etc.)',
    parameters: {
      name: { type: 'string', description: 'Building name' },
      level: { type: 'number', description: 'Starting level (default 1)' },
    },
  },
  {
    name: 'upgrade_building',
    description: 'Upgrade a BUILDING to the next level. Use this when a building (Craftsman, Alchemist, Barracks, etc.) is upgraded or leveled up. NOT for characters.',
    parameters: {
      name: { type: 'string', description: 'Building name' },
    },
  },
  {
    name: 'add_character',
    description: 'Add a brand new character to the campaign party for the first time. Only use when a character is JOINING the party, not when updating an existing one.',
    parameters: {
      name: { type: 'string', description: 'Character name' },
      className: { type: 'string', description: 'Class name (e.g. Drifter, Boneshaper)' },
      level: { type: 'number', description: 'Character level' },
      maxHp: { type: 'number', description: 'Maximum HP' },
    },
  },
  {
    name: 'update_character',
    description: 'Change an existing character\'s level or max HP. Use when a character levels up, gains HP, etc. NOT for adding new characters.',
    parameters: {
      name: { type: 'string', description: 'Character name' },
      updates: {
        type: 'object',
        description: 'Fields to update',
        properties: {
          level: { type: 'number' },
          maxHp: { type: 'number' },
        },
      },
    },
  },
  {
    name: 'retire_character',
    description: 'Permanently retire a character from the campaign party. The character is done adventuring.',
    parameters: {
      name: { type: 'string', description: 'Character name' },
    },
  },
  {
    name: 'update_notes',
    description: 'Replace campaign notes with new text',
    parameters: {
      notes: { type: 'string', description: 'New notes content' },
    },
  },

  // --- Scenario management ---
  {
    name: 'start_scenario',
    description: 'Start a new scenario session. Copies party characters from the current campaign if one is loaded.',
    parameters: {
      name: { type: 'string', description: 'Scenario name or number' },
    },
  },
  {
    name: 'end_scenario',
    description: 'End/finish/complete the current scenario session. Use when the scenario is over, won, lost, or done. NOT for advancing rounds.',
    parameters: {},
  },
  {
    name: 'get_scenario_status',
    description: 'Get the current scenario state: round, elements, characters with HP, monsters with HP. Use for "scenario status", "scenario overview", "what is happening in the scenario".',
    parameters: {},
  },
  {
    name: 'advance_round',
    description: 'Advance to the next round (decays elements, clears initiatives)',
    parameters: {},
  },
  {
    name: 'set_element',
    description: 'Set an element to a specific state',
    parameters: {
      element: {
        type: 'string',
        enum: ['fire', 'ice', 'air', 'earth', 'light', 'dark'],
        description: 'Element name',
      },
      state: {
        type: 'string',
        enum: ['inert', 'strong', 'waning'],
        description: 'Element state',
      },
    },
  },
  {
    name: 'add_monster_group',
    description: 'Add a new monster group to the scenario',
    parameters: {
      name: { type: 'string', description: 'Monster type name (e.g. Living Bones)' },
      maxHpNormal: { type: 'number', description: 'Max HP for normal rank' },
      maxHpElite: { type: 'number', description: 'Max HP for elite rank' },
    },
  },
  {
    name: 'add_standee',
    description: 'Add a monster standee to an existing group',
    parameters: {
      groupName: { type: 'string', description: 'Monster group name' },
      standeeNumber: { type: 'number', description: 'Standee number (1–10)' },
      rank: {
        type: 'string',
        enum: ['normal', 'elite', 'boss'],
        description: 'Monster rank',
      },
    },
  },
  {
    name: 'damage_entity',
    description: 'Deal damage (reduce HP) to a character or monster during a scenario. For monsters use "Group Name #N" format. NOT for healing — use heal_entity for that.',
    parameters: {
      name: { type: 'string', description: 'Character name or "Group Name #N" for monsters' },
      amount: { type: 'number', description: 'Damage amount (positive number)' },
    },
  },
  {
    name: 'heal_entity',
    description: 'Restore HP to a character or monster during a scenario. Use for any healing, recovery, or HP restoration. For monsters use "Group Name #N" format.',
    parameters: {
      name: { type: 'string', description: 'Character name or "Group Name #N" for monsters' },
      amount: { type: 'number', description: 'Heal amount (positive number)' },
    },
  },
  {
    name: 'toggle_condition',
    description: 'Toggle a condition on a character or monster. For monsters use "Group Name #N" format.',
    parameters: {
      name: { type: 'string', description: 'Character name or "Group Name #N" for monsters' },
      condition: {
        type: 'string',
        enum: [
          'poison', 'wound', 'brittle', 'bane', 'stun', 'muddle',
          'immobilize', 'disarm', 'impair',
          'strengthen', 'invisible', 'regenerate', 'ward',
        ],
        description: 'Condition to toggle',
      },
    },
  },
  {
    name: 'kill_standee',
    description: 'Instantly kill/destroy a monster standee (set HP to 0, mark as dead). Use when a monster dies, is killed, or is destroyed. NOT the same as dealing damage.',
    parameters: {
      groupName: { type: 'string', description: 'Monster group name' },
      standeeNumber: { type: 'number', description: 'Standee number' },
    },
  },
  {
    name: 'set_initiative',
    description: 'Set the initiative number for a character or monster group for turn order. Use when someone "goes at" a number, "has initiative", or "drew" a card number.',
    parameters: {
      name: { type: 'string', description: 'Character name or monster group name' },
      initiative: { type: 'number', description: 'Initiative value' },
    },
  },
  {
    name: 'next_turn',
    description: 'End the current entity\'s turn and move to the next one in initiative order. Use for "next turn", "end turn", "done with turn".',
    parameters: {},
  },
  {
    name: 'get_turn_order',
    description: 'Get the current turn order sorted by initiative',
    parameters: {},
  },
  {
    name: 'update_xp',
    description: 'Add or remove XP from a scenario character',
    parameters: {
      name: { type: 'string', description: 'Character name' },
      delta: { type: 'number', description: 'XP to add (negative to subtract)' },
    },
  },
]
