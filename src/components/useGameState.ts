import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot } from '@/tools/state'

export function useGameState() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
