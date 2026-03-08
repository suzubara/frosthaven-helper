import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Campaign } from '@/types/campaign'
import { deleteCampaign, listCampaigns } from '@/api/campaigns'
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    listCampaigns()
      .then(setCampaigns)
      .finally(() => setIsLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return

    const campaign = createNewCampaign(trimmed)

    await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    })

    setNewName('')
    navigate(`/campaign/${campaign.id}`)
  }

  async function handleDelete(id: string) {
    await deleteCampaign(id)
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading campaigns…</p>
      </div>
    )
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
