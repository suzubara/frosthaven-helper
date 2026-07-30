import { Button } from '@/components/ui/button'
import { ELEMENT_NAMES } from '@/data/elements'
import type { ElementName, ElementState } from '@/types/scenario'
import { cn } from '@/lib/utils'

interface ElementBoardProps {
  elements: Record<ElementName, ElementState>
  onSetElement: (element: ElementName, state: ElementState) => void
  compact?: boolean
}

const ELEMENT_EMOJI: Record<ElementName, string> = {
  fire: '🔥',
  ice: '❄️',
  air: '💨',
  earth: '🌍',
  light: '☀️',
  dark: '🌑',
}

export function ElementBoard({
  elements,
  onSetElement,
  compact = false,
}: ElementBoardProps) {
  function handleClick(element: ElementName) {
    const current = elements[element]
    if (current === 'inert') {
      onSetElement(element, 'strong')
    } else {
      onSetElement(element, 'inert')
    }
  }

  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2 sm:grid-cols-6',
        compact && 'grid-cols-6 gap-1.5',
      )}
    >
      {ELEMENT_NAMES.map((name) => {
        const state = elements[name]
        return (
          <Button
            key={name}
            variant={state === 'strong' ? 'default' : 'outline'}
            size={compact ? 'icon-xl' : 'default'}
            aria-label={`${name}: ${state}`}
            title={`${name}: ${state}`}
            className={cn(
              'flex h-auto flex-col gap-1 py-2',
              compact && 'h-11 min-w-11 p-0',
              state === 'strong' && 'ring-2 ring-primary/50',
              state === 'waning' && 'opacity-50',
              state === 'inert' && 'text-muted-foreground',
            )}
            onClick={() => handleClick(name)}
          >
            <span className={cn('text-xl', compact && 'text-lg')}>
              {ELEMENT_EMOJI[name]}
            </span>
            <span className={cn('text-xs capitalize', compact && 'sr-only')}>
              {name}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
