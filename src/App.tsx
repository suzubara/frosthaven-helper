import { Link, Outlet } from 'react-router'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <nav className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
          <Link to="/" className="text-lg font-bold">
            Frosthaven Helper
          </Link>
          <Link to="/scenario" className="text-sm hover:underline">
            Scenario
          </Link>
          <Link to="/campaigns" className="text-sm hover:underline">
            Campaigns
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
