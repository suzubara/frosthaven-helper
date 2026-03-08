import type { ElementName, ElementState } from '@/types/scenario'

export const ELEMENT_NAMES: ElementName[] = [
  'fire', 'ice', 'air', 'earth', 'light', 'dark',
]

export function createDefaultElements(): Record<ElementName, ElementState> {
  return {
    fire: 'inert',
    ice: 'inert',
    air: 'inert',
    earth: 'inert',
    light: 'inert',
    dark: 'inert',
  }
}
