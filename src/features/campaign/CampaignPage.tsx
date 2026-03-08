import { useParams } from 'react-router'

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Campaign Tracker</h1>
      <p className="text-muted-foreground">Campaign ID: {id}</p>
      <p className="text-muted-foreground">Coming soon…</p>
    </div>
  )
}
