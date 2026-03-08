import { ScenarioProvider, useScenario } from '@/features/scenario/ScenarioContext'
import { ScenarioSetup } from '@/features/scenario/ScenarioSetup'
import { ScenarioTracker } from '@/features/scenario/ScenarioTracker'

function ScenarioContent() {
  const { session, dispatch, isLoading } = useScenario()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <ScenarioSetup
        onStart={(s) => dispatch({ type: 'LOAD_SESSION', session: s })}
      />
    )
  }

  return <ScenarioTracker />
}

export default function ScenarioPage() {
  return (
    <ScenarioProvider>
      <ScenarioContent />
    </ScenarioProvider>
  )
}
