import { Link } from 'react-router'

export default function HomePage() {
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
    </div>
  )
}
