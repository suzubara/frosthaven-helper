import type { ScenarioSession } from '@/types/scenario'

const STORAGE_KEY = 'fh:scenarios'

function readAll(): ScenarioSession[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(raw) as ScenarioSession[]
}

function writeAll(sessions: ScenarioSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function saveSession(session: ScenarioSession): void {
  const sessions = readAll()
  const index = sessions.findIndex((s) => s.id === session.id)
  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.push(session)
  }
  writeAll(sessions)
}

export function loadSession(id: string): ScenarioSession | undefined {
  return readAll().find((s) => s.id === id)
}

export function listSessions(): ScenarioSession[] {
  return readAll()
}

export function deleteSession(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id))
}
