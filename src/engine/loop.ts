import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { buildSystemPrompt } from '@/engine/system-prompt'
import { executeTool } from '@/tools/executor'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type OnMessageCallback = (messages: ChatMessage[]) => void

const MAX_TOOL_ROUNDS = 3

function tryParseJSON(text: string): { tool_calls?: Array<{ name: string; arguments: Record<string, unknown> }>; response?: string } | null {
  // Try direct parse
  try {
    return JSON.parse(text)
  } catch {
    // Try to extract JSON from text (model sometimes wraps in markdown or adds preamble)
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        // fall through
      }
    }
    return null
  }
}

export async function sendMessage(
  engine: MLCEngineInterface,
  userMessage: string,
  chatHistory: ChatMessage[],
  onUpdate: OnMessageCallback,
): Promise<ChatMessage[]> {
  const history = [...chatHistory, { role: 'user' as const, content: userMessage }]
  onUpdate(history)

  const systemPrompt = buildSystemPrompt()

  const internalMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage + '\n\n[Respond with JSON only. To act on this request, use {"tool_calls": [{"name": "...", "arguments": {...}}]}]' },
  ]

  let toolRounds = 0

  while (toolRounds < MAX_TOOL_ROUNDS) {
    const completion = await engine.chat.completions.create({
      messages: internalMessages as Parameters<typeof engine.chat.completions.create>[0]['messages'],
      temperature: 0.3,
      max_tokens: 512,
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    console.log('[fh] Raw LLM output:', rawText.substring(0, 500))

    const parsed = tryParseJSON(rawText)

    if (!parsed) {
      // JSON failed — if this was the first attempt, retry once with a stronger hint
      if (toolRounds === 0) {
        internalMessages.push({ role: 'assistant', content: rawText })
        internalMessages.push({ role: 'user', content: 'That was not valid JSON. Reply with ONLY a JSON object like: {"tool_calls": [{"name": "...", "arguments": {...}}]} or {"response": "..."}' })
        toolRounds++
        continue
      }
      // Give up and show raw text
      const updated = [...history, { role: 'assistant' as const, content: rawText }]
      onUpdate(updated)
      return updated
    }

    if (parsed.tool_calls && parsed.tool_calls.length > 0) {
      console.log('[fh] Tool calls:', JSON.stringify(parsed.tool_calls))
      const results = parsed.tool_calls.map((call) => {
        try {
          const result = executeTool(call.name, call.arguments)
          console.log(`[fh] ${call.name}:`, result)
          return { name: call.name, result }
        } catch (err) {
          return { name: call.name, result: `Error: ${err instanceof Error ? err.message : String(err)}` }
        }
      })

      const toolResultMessage = 'Tool results:\n' + results.map((r) => `${r.name}: ${r.result}`).join('\n') + '\n\nTools executed successfully. Do NOT call tools again. Respond with ONLY: {"response": "brief summary of what was done"}'
      internalMessages.push({ role: 'assistant', content: rawText })
      internalMessages.push({ role: 'user', content: toolResultMessage })

      // After first successful tool execution, just get the summary response
      const summaryCompletion = await engine.chat.completions.create({
        messages: internalMessages as Parameters<typeof engine.chat.completions.create>[0]['messages'],
        temperature: 0.3,
        max_tokens: 256,
      })
      const summaryRaw = summaryCompletion.choices[0]?.message?.content ?? ''
      console.log('[fh] Summary output:', summaryRaw.substring(0, 300))
      const summaryParsed = tryParseJSON(summaryRaw)
      const responseText = summaryParsed?.response ?? results.map((r) => r.result).join(' ')
      const updated = [...history, { role: 'assistant' as const, content: responseText }]
      onUpdate(updated)
      return updated
    }

    const responseText = parsed.response ?? rawText
    const updated = [...history, { role: 'assistant' as const, content: responseText }]
    onUpdate(updated)
    return updated
  }

  // Max tool rounds reached — extract whatever response we have
  const lastMessage = internalMessages[internalMessages.length - 1]
  let fallbackResponse = 'I completed the requested actions.'

  if (lastMessage?.role === 'user' && lastMessage.content.startsWith('Tool results:')) {
    fallbackResponse = lastMessage.content.replace(/\n\nNow respond.*$/, '')
  }

  const updated = [...history, { role: 'assistant' as const, content: fallbackResponse }]
  onUpdate(updated)
  return updated
}
