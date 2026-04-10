import { useState } from 'react'
import { getAvailableModels } from '@/engine/llm'

interface ModelLoaderProps {
  onLoaded: (modelId: string) => void
  loading: boolean
  progress: { text: string; progress: number } | null
}

export default function ModelLoader({ onLoaded, loading, progress }: ModelLoaderProps) {
  const models = getAvailableModels()
  const [selectedModel, setSelectedModel] = useState(models[0].id)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Frosthaven Helper</h1>
          <p className="text-muted-foreground text-sm">
            AI-powered game assistant — runs entirely in your browser
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="model-select" className="text-sm font-medium">
              Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loading}
              className="bg-background border-input w-full rounded-md border px-3 py-2 text-sm"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} (~{(m.vramMB / 1024).toFixed(1)} GB)
                </option>
              ))}
            </select>
          </div>

          {loading && progress ? (
            <div className="space-y-2">
              <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(progress.progress * 100)}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs">{progress.text}</p>
            </div>
          ) : (
            <button
              onClick={() => onLoaded(selectedModel)}
              className="bg-primary text-primary-foreground w-full rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            >
              Load Model
            </button>
          )}

          <p className="text-muted-foreground text-center text-xs">
            Requires WebGPU support. First load downloads the model (~1–5 GB).
          </p>
        </div>
      </div>
    </div>
  )
}
