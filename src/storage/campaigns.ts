import type { Campaign } from '@/types/campaign'

const STORAGE_KEY = 'fh:campaigns'

function readAll(): Campaign[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(raw) as Campaign[]
}

function writeAll(campaigns: Campaign[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
}

export function saveCampaign(campaign: Campaign): void {
  const campaigns = readAll()
  const index = campaigns.findIndex((c) => c.id === campaign.id)
  if (index >= 0) {
    campaigns[index] = campaign
  } else {
    campaigns.push(campaign)
  }
  writeAll(campaigns)
}

export function loadCampaign(id: string): Campaign | undefined {
  return readAll().find((c) => c.id === id)
}

export function listCampaigns(): Campaign[] {
  return readAll()
}

export function deleteCampaign(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id))
}
