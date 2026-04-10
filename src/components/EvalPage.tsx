import { useState } from 'react'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { runEval, type EvalResult, type EvalSummary } from '@/eval/runner'
import { EVAL_CASES } from '@/eval/test-cases'

interface EvalPageProps {
  engine: MLCEngineInterface
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export default function EvalPage({ engine }: EvalPageProps) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  const [summary, setSummary] = useState<EvalSummary | null>(null)
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set())

  const handleRun = async () => {
    setRunning(true)
    setSummary(null)
    setExpandedIdx(new Set())
    setProgress({ completed: 0, total: EVAL_CASES.length })

    try {
      const result = await runEval(engine, EVAL_CASES, (completed, total) => {
        setProgress({ completed, total })
      })
      setSummary(result)
    } catch (err) {
      console.error('Eval failed:', err)
    } finally {
      setRunning(false)
      setProgress(null)
    }
  }

  const toggleExpanded = (idx: number) => {
    setExpandedIdx((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const sortedResults = summary
    ? [...summary.results].sort((a, b) => {
        if (a.passed === b.passed) return 0
        return a.passed ? 1 : -1
      })
    : []

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Prompt Eval</h1>
        <button
          onClick={handleRun}
          disabled={running}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run Evaluation'}
        </button>
      </div>

      {progress && (
        <div className="space-y-1">
          <div className="text-muted-foreground text-sm">
            {progress.completed} / {progress.total} completed
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {summary && (
        <>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium">
              Overall: {summary.passed}/{summary.total} passed ({pct(summary.accuracy)})
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-sm font-semibold">By Category</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1 pr-4">Category</th>
                    <th className="py-1 pr-4">Passed</th>
                    <th className="py-1 pr-4">Total</th>
                    <th className="py-1">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byCategory).map(([cat, stats]) => (
                    <tr key={cat} className="border-b border-border/50">
                      <td className="py-1 pr-4">{cat}</td>
                      <td className="py-1 pr-4">{stats.passed}</td>
                      <td className="py-1 pr-4">{stats.total}</td>
                      <td className="py-1">{pct(stats.accuracy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold">By Tool</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1 pr-4">Tool</th>
                    <th className="py-1 pr-4">Passed</th>
                    <th className="py-1 pr-4">Total</th>
                    <th className="py-1">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byTool).map(([tool, stats]) => (
                    <tr key={tool} className="border-b border-border/50">
                      <td className="py-1 pr-4 font-mono text-xs">{tool}</td>
                      <td className="py-1 pr-4">{stats.passed}</td>
                      <td className="py-1 pr-4">{stats.total}</td>
                      <td className="py-1">{pct(stats.accuracy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Results</h2>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto">
              {sortedResults.map((result, i) => {
                const originalIdx = summary.results.indexOf(result)
                const isExpanded = expandedIdx.has(originalIdx)

                return (
                  <div
                    key={originalIdx}
                    className={`rounded-lg border p-3 text-sm ${
                      result.passed ? 'border-border' : 'border-red-500/50 bg-red-500/5'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpanded(originalIdx)}
                      className="flex w-full items-start justify-between text-left"
                    >
                      <div className="flex-1 space-y-1">
                        <p>{result.input}</p>
                        <div className="text-muted-foreground flex gap-4 text-xs">
                          <span>Expected: {result.expectedTools.length > 0 ? result.expectedTools.join(', ') : '(none)'}</span>
                          <span>Actual: {result.actualTools.length > 0 ? result.actualTools.join(', ') : '(none)'}</span>
                        </div>
                      </div>
                      <span
                        className={`ml-3 shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                          result.passed
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {result.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-muted-foreground mb-1 text-xs">
                          Category: {result.category} · {result.durationMs.toFixed(0)}ms
                        </p>
                        <pre className="bg-muted max-h-48 overflow-auto rounded p-2 text-xs whitespace-pre-wrap">
                          {result.rawOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
