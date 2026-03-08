import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Campaign } from '@/types/campaign'
import {
  deleteCampaign,
  listCampaigns,
  saveCampaign,
} from '@/storage/campaigns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function createNewCampaign(name: string): Campaign {
  return {
    id: crypto.randomUUID(),
    name,
    calendar: Array.from({ length: 80 }, () => ({ marked: false, sections: [] })),
    resources: {
      lumber: 0,
      metal: 0,
      hide: 0,
      arrowvine: 0,
      axenut: 0,
      corpsecap: 0,
      flamefruit: 0,
      rockroot: 0,
      snowthistle: 0,
    },
    morale: 0,
    prosperityCheckmarks: 0,
    totalDefense: 0,
    soldiers: 0,
    barracksMaxSoldiers: 0,
    inspiration: 0,
    buildings: [],
    party: [],
    campaignStickers: [],
    notes: '',
    retirements: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => listCampaigns())
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return

    const campaign = createNewCampaign(trimmed)
    saveCampaign(campaign)

    setNewName('')
    navigate(`/campaign/${campaign.id}`)
  }

  function handleDelete(id: string) {
    deleteCampaign(id)
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Campaigns</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New campaign name…"
        />
        <Button type="submit" disabled={!newName.trim()}>
          Create
        </Button>
      </form>

      {campaigns.length === 0 ? (
        <p className="text-muted-foreground">
          No campaigns yet. Create one above to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {campaigns
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((campaign) => (
              <li
                key={campaign.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <Link
                  to={`/campaign/${campaign.id}`}
                  className="font-medium hover:underline"
                >
                  {campaign.name}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(campaign.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
