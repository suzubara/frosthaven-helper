import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { exportGameData, importGameData } from '@/storage/export'

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<{
    campaigns: number
    scenarios: number
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    setImportResult(null)

    if (
      !window.confirm(
        'This will replace all existing game data. Are you sure?',
      )
    ) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      const result = await importGameData(file)
      setImportResult(result)
    } catch {
      setImportError('Failed to import — invalid file format.')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-6">Frosthaven Helper</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/scenario"
          className="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">⚔️ Scenario Tracker</h2>
          <p className="text-muted-foreground">
            Track rounds, HP, conditions, and elements during a scenario.
          </p>
        </Link>

        <Link
          to="/campaigns"
          className="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">📜 Campaign Tracker</h2>
          <p className="text-muted-foreground">
            Track resources, morale, prosperity, buildings, and party roster
            between scenarios.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">💾 Data Backup</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportGameData}>
            Export Game Data
          </Button>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Game Data
            </Button>
          </div>
        </div>
        {importResult && (
          <p className="mt-3 text-sm text-green-600">
            Imported {importResult.campaigns} campaign(s) and{' '}
            {importResult.scenarios} scenario(s).
          </p>
        )}
        {importError && (
          <p className="mt-3 text-sm text-destructive">{importError}</p>
        )}
      </div>
    </div>
  )
}
