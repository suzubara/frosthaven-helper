import type { ScenarioSession } from '@/types/scenario'

export async function saveSession(session: ScenarioSession): Promise<void> {
  await fetch(`/api/scenarios/${session.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
}

export async function loadSession(id: string): Promise<ScenarioSession | undefined> {
  const res = await fetch(`/api/scenarios/${id}`)
  if (res.status === 404) return undefined
  return res.json()
}

export async function listSessions(): Promise<ScenarioSession[]> {
  const res = await fetch('/api/scenarios')
  return res.json()
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
}
