import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCalendarPosition } from '@/features/campaign/campaignReducer'
import { cn } from '@/lib/utils'
import type { CalendarWeek } from '@/types/campaign'

interface CampaignCalendarProps {
  calendar: CalendarWeek[]
  onMarkWeek: () => void
  onUnmarkWeek: () => void
  onAddSection: (weekIndex: number, section: string) => void
  onRemoveSection: (weekIndex: number, section: string) => void
}

const SEASON_LABELS = [
  'Summer Y1',
  'Winter Y1',
  'Summer Y2',
  'Winter Y2',
  'Summer Y3',
  'Winter Y3',
  'Summer Y4',
  'Winter Y4',
]

export function CampaignCalendar({
  calendar,
  onMarkWeek,
  onUnmarkWeek,
  onAddSection,
  onRemoveSection,
}: CampaignCalendarProps) {
  const [weekInput, setWeekInput] = useState('')
  const [sectionInput, setSectionInput] = useState('')

  const markedWeeks = calendar.filter((w) => w.marked).length
  const { year, season, weekInSeason } = getCalendarPosition(markedWeeks)

  const positionLabel =
    markedWeeks === 0
      ? 'Not started'
      : `Year ${year} · ${season === 'summer' ? 'Summer' : 'Winter'} · Week ${weekInSeason}`

  function handleAddSection() {
    const weekIndex = parseInt(weekInput, 10) - 1
    if (isNaN(weekIndex) || weekIndex < 0 || weekIndex >= 80) return
    if (!sectionInput.trim()) return

    onAddSection(weekIndex, sectionInput.trim())
    setSectionInput('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Calendar</CardTitle>
        <p className="text-sm text-muted-foreground">{positionLabel}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {SEASON_LABELS.map((label, rowIndex) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">
                {label}
              </span>
              <div className="flex gap-1">
                {calendar
                  .slice(rowIndex * 10, rowIndex * 10 + 10)
                  .map((week, i) => {
                    const weekIndex = rowIndex * 10 + i
                    const hasSections = week.sections.length > 0
                    const titleParts = [`Week ${weekIndex + 1}`]
                    if (hasSections) {
                      titleParts.push(`Sections: ${week.sections.join(', ')}`)
                    }

                    return (
                      <button
                        key={weekIndex}
                        type="button"
                        title={titleParts.join('\n')}
                        onClick={() => {
                          if (week.marked && hasSections) {
                            const section = window.prompt(
                              `Remove section from week ${weekIndex + 1}?\nCurrent: ${week.sections.join(', ')}`,
                            )
                            if (section && week.sections.includes(section)) {
                              onRemoveSection(weekIndex, section)
                            }
                          }
                        }}
                        className={cn(
                          'relative size-6 rounded text-[10px] font-medium transition-colors',
                          week.marked
                            ? 'bg-primary text-primary-foreground'
                            : 'border bg-background',
                        )}
                      >
                        {hasSections && (
                          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive" />
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={onMarkWeek} disabled={markedWeeks >= 80}>
            Mark Next Week
          </Button>
          <Button
            variant="outline"
            onClick={onUnmarkWeek}
            disabled={markedWeeks === 0}
          >
            Undo
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Week #"
            min={1}
            max={80}
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            className="w-20"
          />
          <Input
            type="text"
            placeholder="Section"
            value={sectionInput}
            onChange={(e) => setSectionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection()
            }}
          />
          <Button variant="secondary" onClick={handleAddSection}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
