import { openDB } from 'idb'
import type { ScenarioSession } from '@/types/scenario'

const DB_NAME = 'frosthaven-helper'
const DB_VERSION = 1
const STORE_NAME = 'scenarios'

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    },
  })
}

export async function saveSession(session: ScenarioSession): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, session)
}

export async function loadSession(id: string): Promise<ScenarioSession | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function listSessions(): Promise<ScenarioSession[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}
