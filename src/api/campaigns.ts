import type { Campaign } from '@/types/campaign'

export async function saveCampaign(campaign: Campaign): Promise<void> {
  await fetch(`/api/campaigns/${campaign.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  })
}

export async function loadCampaign(id: string): Promise<Campaign | undefined> {
  const res = await fetch(`/api/campaigns/${id}`)
  if (res.status === 404) return undefined
  return res.json()
}

export async function listCampaigns(): Promise<Campaign[]> {
  const res = await fetch('/api/campaigns')
  return res.json()
}

export async function deleteCampaign(id: string): Promise<void> {
  await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
}
