import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { buildSystemPrompt } from '@/engine/system-prompt'
import type { EvalCase } from './test-cases'

export interface EvalResult {
  input: string
  category: string
  expectedTools: string[]
  actualTools: string[]
  passed: boolean
  rawOutput: string
  durationMs: number
}

export interface EvalSummary {
  total: number
  passed: number
  failed: number
  accuracy: number
  byCategory: Record<string, { total: number; passed: number; accuracy: number }>
  byTool: Record<string, { total: number; passed: number; accuracy: number }>
  results: EvalResult[]
}

function tryParseJSON(text: string): { tool_calls?: Array<{ name: string; arguments: Record<string, unknown> }>; response?: string } | null {
  try {
    return JSON.parse(text)
  } catch {
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

export async function runEval(
  engine: MLCEngineInterface,
  cases: EvalCase[],
  onProgress: (completed: number, total: number, result: EvalResult) => void,
): Promise<EvalSummary> {
  const systemPrompt = buildSystemPrompt()
  const results: EvalResult[] = []

  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i]
    const start = performance.now()

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: testCase.input + '\n\n[Respond with JSON only. To act on this request, use {"tool_calls": [{"name": "...", "arguments": {...}}]}]',
      },
    ]

    const completion = await engine.chat.completions.create({
      messages,
      temperature: 0.1,
      max_tokens: 512,
    })

    const rawOutput = completion.choices[0]?.message?.content ?? ''
    const durationMs = performance.now() - start

    const parsed = tryParseJSON(rawOutput)
    const actualTools = parsed?.tool_calls?.map((tc) => tc.name) ?? []

    let passed: boolean
    if (testCase.expectedTools.length === 0) {
      passed = actualTools.length === 0
    } else {
      passed = testCase.expectedTools.every((t) => actualTools.includes(t))
    }

    const result: EvalResult = {
      input: testCase.input,
      category: testCase.category,
      expectedTools: testCase.expectedTools,
      actualTools,
      passed,
      rawOutput,
      durationMs,
    }

    results.push(result)
    onProgress(i + 1, cases.length, result)
  }

  const passed = results.filter((r) => r.passed).length

  const byCategory: EvalSummary['byCategory'] = {}
  for (const r of results) {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { total: 0, passed: 0, accuracy: 0 }
    }
    byCategory[r.category].total++
    if (r.passed) byCategory[r.category].passed++
  }
  for (const cat of Object.values(byCategory)) {
    cat.accuracy = cat.total > 0 ? cat.passed / cat.total : 0
  }

  const byTool: EvalSummary['byTool'] = {}
  for (const r of results) {
    for (const tool of r.expectedTools) {
      if (!byTool[tool]) {
        byTool[tool] = { total: 0, passed: 0, accuracy: 0 }
      }
      byTool[tool].total++
      if (r.actualTools.includes(tool)) byTool[tool].passed++
    }
  }
  for (const tool of Object.values(byTool)) {
    tool.accuracy = tool.total > 0 ? tool.passed / tool.total : 0
  }

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    accuracy: results.length > 0 ? passed / results.length : 0,
    byCategory,
    byTool,
    results,
  }
}
