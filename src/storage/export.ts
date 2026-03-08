import type { Campaign } from '@/types/campaign'
import type { ScenarioSession } from '@/types/scenario'

interface GameData {
  campaigns: Campaign[]
  scenarios: ScenarioSession[]
}

export function exportGameData(): void {
  const campaigns = JSON.parse(
    localStorage.getItem('fh:campaigns') || '[]',
  ) as Campaign[]
  const scenarios = JSON.parse(
    localStorage.getItem('fh:scenarios') || '[]',
  ) as ScenarioSession[]

  const data: GameData = { campaigns, scenarios }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  const date = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `frosthaven-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importGameData(
  file: File,
): Promise<{ campaigns: number; scenarios: number }> {
  const text = await file.text()
  const data = JSON.parse(text) as GameData

  const campaigns = Array.isArray(data.campaigns) ? data.campaigns : []
  const scenarios = Array.isArray(data.scenarios) ? data.scenarios : []

  localStorage.setItem('fh:campaigns', JSON.stringify(campaigns))
  localStorage.setItem('fh:scenarios', JSON.stringify(scenarios))

  return { campaigns: campaigns.length, scenarios: scenarios.length }
}
