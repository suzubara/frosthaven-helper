import { Button } from '@/components/ui/button'

interface RoundTrackerProps {
  round: number
  onAdvance: () => void
  onRewind: () => void
}

export function RoundTracker({ round, onAdvance, onRewind }: RoundTrackerProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onRewind}>
        ‹
      </Button>
      <span className="text-sm font-medium">Round: {round}</span>
      <Button variant="outline" size="icon" onClick={onAdvance}>
        ›
      </Button>
    </div>
  )
}
