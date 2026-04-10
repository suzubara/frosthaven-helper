import { TOOL_DEFINITIONS } from '@/tools/definitions'

export function buildSystemPrompt(): string {
  const campaignTools = TOOL_DEFINITIONS.filter((t) =>
    [
      'list_campaigns', 'create_campaign', 'load_campaign', 'get_campaign_status',
      'update_resource', 'update_morale', 'update_prosperity', 'update_defense',
      'update_soldiers', 'update_inspiration', 'mark_week',
      'add_building', 'upgrade_building',
      'add_character', 'update_character', 'retire_character',
      'update_notes',
    ].includes(t.name),
  )

  const scenarioTools = TOOL_DEFINITIONS.filter((t) =>
    [
      'start_scenario', 'end_scenario', 'get_scenario_status', 'advance_round',
      'set_element', 'add_monster_group', 'add_standee',
      'damage_entity', 'heal_entity', 'toggle_condition', 'kill_standee',
      'set_initiative', 'next_turn', 'get_turn_order', 'update_xp',
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

## Rules

- If the user's request requires modifying or reading game state, include the appropriate tool_calls.
- If responding to the user conversationally or summarizing results, include a response.
- You can include BOTH tool_calls and response in the same message.
- If you include tool_calls, you will receive the results and can then respond.
- Always use the exact tool names and parameter names defined above.
- For damage/heal, use positive numbers for the amount parameter.
- Keep responses SHORT (1-3 sentences). Only state what changed or was requested.
- Do NOT repeat tool results verbatim. Summarize briefly.
- Do NOT generate lists longer than 10 items. If there are more, say "and N more".
- Do NOT invent or fabricate game state. Only report what the tools return.
- If the user asks a general question, says thanks, or makes conversation that does NOT require changing or reading game state, respond with {"response": "..."} and NO tool_calls.
- Only use tool_calls when the user wants to CREATE, MODIFY, or READ game data.`
}
