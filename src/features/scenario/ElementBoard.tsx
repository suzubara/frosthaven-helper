import { Button } from '@/components/ui/button'
import { ELEMENT_NAMES } from '@/data/elements'
import type { ElementName, ElementState } from '@/types/scenario'
import { cn } from '@/lib/utils'

interface ElementBoardProps {
  elements: Record<ElementName, ElementState>
  onSetElement: (element: ElementName, state: ElementState) => void
}

const ELEMENT_EMOJI: Record<ElementName, string> = {
  fire: '🔥',
  ice: '❄️',
  air: '💨',
  earth: '🌍',
  light: '☀️',
  dark: '🌑',
}

export function ElementBoard({ elements, onSetElement }: ElementBoardProps) {
  function handleClick(element: ElementName) {
    const current = elements[element]
    if (current === 'inert') {
      onSetElement(element, 'strong')
    } else {
      onSetElement(element, 'inert')
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ELEMENT_NAMES.map((name) => {
        const state = elements[name]
        return (
          <Button
            key={name}
            variant={state === 'strong' ? 'default' : 'outline'}
            className={cn(
              'flex h-auto flex-col gap-1 py-2',
              state === 'strong' && 'ring-2 ring-primary/50',
              state === 'waning' && 'opacity-50',
              state === 'inert' && 'text-muted-foreground',
            )}
            onClick={() => handleClick(name)}
          >
            <span className="text-xl">{ELEMENT_EMOJI[name]}</span>
            <span className="text-xs capitalize">{name}</span>
          </Button>
        )
      })}
    </div>
  )
}
