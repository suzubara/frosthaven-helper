import { useState, useCallback } from 'react'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { initEngine } from '@/engine/llm'
import { sendMessage, type ChatMessage } from '@/engine/loop'
import ModelLoader from '@/components/ModelLoader'
import Chat from '@/components/Chat'
import GameStatePanel from '@/components/GameStatePanel'

type AppState = 'setup' | 'loading' | 'ready'

export default function App() {
  const [appState, setAppState] = useState<AppState>('setup')
  const [engine, setEngine] = useState<MLCEngineInterface | null>(null)
  const [loadProgress, setLoadProgress] = useState<{ text: string; progress: number } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)

  const handleLoadModel = useCallback(async (modelId: string) => {
    setAppState('loading')
    setLoadProgress({ text: 'Initializing...', progress: 0 })

    try {
      const eng = await initEngine(modelId, (progress) => {
        setLoadProgress(progress)
      })
      setEngine(eng)
      setAppState('ready')
    } catch (err) {
      console.error('Failed to load model:', err)
      setAppState('setup')
      setLoadProgress(null)
      alert(`Failed to load model: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [])

  const handleSend = useCallback(async (userMessage: string) => {
    if (!engine || sending) return
    setSending(true)

    try {
      const updated = await sendMessage(engine, userMessage, messages, setMessages)
      setMessages(updated)
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : String(err)}` },
      ])
    } finally {
      setSending(false)
    }
  }, [engine, messages, sending])

  if (appState !== 'ready') {
    return (
      <ModelLoader
        onLoaded={handleLoadModel}
        loading={appState === 'loading'}
        progress={loadProgress}
      />
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Frosthaven Helper</span>
          <button
            onClick={() => setMessages([])}
            className="text-muted-foreground text-xs hover:underline"
          >
            Clear chat
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r md:block">
          <GameStatePanel />
        </aside>
        <div className="flex-1">
          <Chat messages={messages} onSend={handleSend} sending={sending} />
        </div>
      </div>
    </div>
  )
}
