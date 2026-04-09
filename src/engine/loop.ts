import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { buildSystemPrompt } from '@/engine/system-prompt'
import { executeTool } from '@/tools/executor'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type OnMessageCallback = (messages: ChatMessage[]) => void

const MAX_TOOL_ROUNDS = 3

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
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ]

  let toolRounds = 0

  while (toolRounds < MAX_TOOL_ROUNDS) {
    const completion = await engine.chat.completions.create({
      messages: internalMessages as Parameters<typeof engine.chat.completions.create>[0]['messages'],
      temperature: 0.3,
      max_tokens: 512,
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    let parsed: { tool_calls?: Array<{ name: string; arguments: Record<string, unknown> }>; response?: string }

    try {
      parsed = JSON.parse(rawText)
    } catch {
      const updated = [...history, { role: 'assistant' as const, content: rawText }]
      onUpdate(updated)
      return updated
    }

    if (parsed.tool_calls && parsed.tool_calls.length > 0) {
      const results = parsed.tool_calls.map((call) => {
        try {
          return { name: call.name, result: executeTool(call.name, call.arguments) }
        } catch (err) {
          return { name: call.name, result: `Error: ${err instanceof Error ? err.message : String(err)}` }
        }
      })

      const toolResultMessage = 'Tool results:\n' + results.map((r) => `${r.name}: ${r.result}`).join('\n') + '\n\nNow respond to the user with a summary. Reply with JSON: { "response": "..." }'
      internalMessages.push({ role: 'assistant', content: rawText })
      internalMessages.push({ role: 'user', content: toolResultMessage })
      toolRounds++
      continue
    }

    const responseText = parsed.response ?? rawText
    const updated = [...history, { role: 'assistant' as const, content: responseText }]
    onUpdate(updated)
    return updated
  }

  // Max tool rounds reached — extract whatever response we have
  const lastMessage = internalMessages[internalMessages.length - 1]
  let fallbackResponse = 'I completed the requested actions.'

  if (lastMessage?.role === 'system' && lastMessage.content.startsWith('Tool results:')) {
    fallbackResponse = lastMessage.content
  }

  const updated = [...history, { role: 'assistant' as const, content: fallbackResponse }]
  onUpdate(updated)
  return updated
}
