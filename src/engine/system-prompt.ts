import { TOOL_DEFINITIONS } from '@/tools/definitions'

export function buildSystemPrompt(): string {
  const campaignTools = TOOL_DEFINITIONS.filter((t) =>
    [
      'list_campaigns', 'create_campaign', 'load_campaign', 'get_campaign_status',
      'update_resource', 'update_morale', 'update_prosperity', 'update_defense',
      'update_soldiers', 'update_inspiration', 'mark_week',
      'add_building', 'level_up_building',
      'add_character', 'level_up_character', 'retire_character',
      'update_notes',
    ].includes(t.name),
  )

  const scenarioTools = TOOL_DEFINITIONS.filter((t) =>
    [
      'start_scenario', 'end_scenario', 'get_scenario_status', 'advance_round',
      'set_element', 'add_monster_group', 'add_standee',
      'damage', 'heal', 'toggle_condition', 'kill_standee',
      'set_initiative', 'end_turn', 'get_turn_order', 'update_xp',
    ].includes(t.name),
  )

  const formatTools = (tools: typeof TOOL_DEFINITIONS) =>
    tools
      .map((t) => {
        const params = Object.entries(t.parameters)
        const paramStr =
          params.length > 0
            ? params
                .map(([key, val]) => {
                  const v = val as Record<string, unknown>
                  let desc = `${key} (${v.type}): ${v.description || ''}`
                  if (v.enum) desc += ` [${(v.enum as string[]).join(', ')}]`
                  return `    - ${desc}`
                })
                .join('\n')
            : '    (none)'
        return `  ${t.name}: ${t.description}\n${paramStr}`
      })
      .join('\n\n')

  return `You are a Frosthaven board game assistant. You manage game state through tool calls.

## Available Tools

### Campaign Management
${formatTools(campaignTools)}

### Scenario Management
${formatTools(scenarioTools)}

## Response Format

ALWAYS respond with valid JSON and nothing else. Use this schema:

{
  "tool_calls": [{ "name": "tool_name", "arguments": { ... } }],
  "response": "text to show the user"
}

## Important Disambiguation

- "level up a CHARACTER" or "Suz is now level 3" → use level_up_character (NOT add_character)
- "upgrade a BUILDING" or "level up the Craftsman" → use level_up_building (NOT add_building)
- "heal Suz" or "recover HP" → use heal (NOT level_up_character)
- "end turn" or "next turn" or "whose turn" → use end_turn (NOT get_turn_order)
- "scenario is over" or "we won" → use end_scenario (NOT advance_round)
- "place standee #3" or "spawn #2" → use add_standee (NOT add_monster_group)
- Questions like "what is Frosthaven?", "thanks", "how do conditions work?" → respond with {"response": "..."} only, NO tool_calls

## Rules

- If the user's request requires modifying or reading game state, include the appropriate tool_calls.
- If responding conversationally (thanks, questions about rules, etc.), respond with {"response": "..."} and NO tool_calls.
- Always use the EXACT tool names listed above. Do NOT invent tool names.
- For damage/heal, use positive numbers for the amount parameter.
- Keep responses SHORT (1-3 sentences).
- Do NOT invent or fabricate game state. Only report what the tools return.`
}
