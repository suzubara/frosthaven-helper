import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ScenarioSession } from '@/types/scenario'
import {
  initialState,
  scenarioReducer,
  type ScenarioAction,
} from '@/features/scenario/scenarioReducer'
import { deleteSession, listSessions, saveSession } from '@/api/scenarios'

interface ScenarioContextValue {
  session: ScenarioSession | null
  dispatch: React.Dispatch<ScenarioAction>
  isLoading: boolean
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(scenarioReducer, initialState)
  const [isLoading, setIsLoading] = useState(true)
  const prevSessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadLatestSession() {
      try {
        const sessions = await listSessions()
        if (cancelled) return

        if (sessions.length > 0) {
          const latest = sessions.reduce((a, b) =>
            a.updatedAt > b.updatedAt ? a : b,
          )
          dispatch({ type: 'LOAD_SESSION', session: latest })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadLatestSession()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isLoading) return

    const prevId = prevSessionIdRef.current
    prevSessionIdRef.current = session?.id ?? null

    if (session === null) {
      if (prevId) {
        void deleteSession(prevId)
      }
      return
    }

    void saveSession({ ...session, updatedAt: Date.now() })
  }, [session, isLoading])

  return (
    <ScenarioContext value={{ session, dispatch, isLoading }}>
      {children}
    </ScenarioContext>
  )
}

export function useScenario(): ScenarioContextValue {
  const context = useContext(ScenarioContext)
  if (context === null) {
    throw new Error('useScenario must be used within a ScenarioProvider')
  }
  return context
}
