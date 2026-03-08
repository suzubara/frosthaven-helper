import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { ScenarioSession } from '@/types/scenario'
import {
  initialState,
  scenarioReducer,
  type ScenarioAction,
} from '@/features/scenario/scenarioReducer'
import { deleteSession, listSessions, saveSession } from '@/storage/scenarios'

interface ScenarioContextValue {
  session: ScenarioSession | null
  dispatch: React.Dispatch<ScenarioAction>
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(scenarioReducer, undefined, () => {
    const sessions = listSessions()
    if (sessions.length > 0) {
      return sessions.reduce((a, b) =>
        a.updatedAt > b.updatedAt ? a : b,
      )
    }
    return initialState
  })
  const savedSessionRef = useRef<ScenarioSession | null>(session)
  const prevSessionIdRef = useRef<string | null>(session?.id ?? null)

  useEffect(() => {
    const prevId = prevSessionIdRef.current
    prevSessionIdRef.current = session?.id ?? null

    if (session === null) {
      if (prevId && savedSessionRef.current !== session) {
        deleteSession(prevId)
        savedSessionRef.current = null
      }
      return
    }

    if (session === savedSessionRef.current) return

    savedSessionRef.current = session
    saveSession({ ...session, updatedAt: Date.now() })
  }, [session])

  const value = useMemo(
    () => ({ session, dispatch }),
    [session, dispatch],
  )

  return (
    <ScenarioContext value={value}>
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
