import { CreateWebWorkerMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm'

export type LoadingCallback = (progress: { text: string; progress: number }) => void

export async function initEngine(
  modelId: string,
  onProgress: LoadingCallback,
): Promise<MLCEngineInterface> {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

  const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
    initProgressCallback: onProgress,
  })

  return engine
}

export function getAvailableModels(): Array<{ id: string; label: string; vramMB: number }> {
  return [
    { id: 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC', label: 'Hermes 3 Llama 3.2 3B (recommended)', vramMB: 2264 },
    { id: 'Hermes-3-Llama-3.1-8B-q4f16_1-MLC', label: 'Hermes 3 Llama 3.1 8B (best quality)', vramMB: 4876 },
    { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 1.5B (lightweight)', vramMB: 1630 },
    { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 3B', vramMB: 2505 },
    { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 3B', vramMB: 2264 },
    { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', label: 'Phi 3.5 Mini', vramMB: 3672 },
  ]
}
