import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/engine/loop'

interface ChatProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
  sending: boolean
}

export default function Chat({ messages, onSend, sending }: ChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || sending) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && (
            <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center text-center text-sm">
              <div className="space-y-2">
                <p className="text-lg font-medium">Frosthaven Helper</p>
                <p>Try: &quot;Create a new campaign called Frostgate&quot;</p>
                <p>Or: &quot;Start scenario 1 and add some monsters&quot;</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2.5 text-sm">
                <span className="animate-pulse">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t px-4 py-3">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell the assistant what to do..."
            disabled={sending}
            rows={1}
            className="bg-muted flex-1 resize-none rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
