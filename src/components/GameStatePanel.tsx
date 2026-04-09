import { useGameState } from './useGameState'
import {
  getProsperityLevel,
  getCalendarPosition,
  getMoraleDefenseModifier,
} from '@/features/campaign/campaignReducer'
import { getSortedTurnOrder } from '@/features/scenario/turnOrder'

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'negative' | 'positive' | 'element' }) {
  const colors = {
    default: 'bg-muted text-foreground',
    negative: 'bg-red-500/15 text-red-700 dark:text-red-400',
    positive: 'bg-green-500/15 text-green-700 dark:text-green-400',
    element: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  }
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${colors[variant]}`}>
      {children}
    </span>
  )
}

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? (current / max) * 100 : 0
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-muted-foreground text-[10px]">{current}/{max}</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}

const NEGATIVE_CONDITIONS = ['poison', 'wound', 'brittle', 'bane', 'stun', 'muddle', 'immobilize', 'disarm', 'impair']

function ConditionBadges({ conditions }: { conditions: string[] }) {
  if (conditions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-0.5">
      {conditions.map((c) => (
        <Badge key={c} variant={NEGATIVE_CONDITIONS.includes(c) ? 'negative' : 'positive'}>{c}</Badge>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

export default function GameStatePanel() {
  const { campaign, scenario } = useGameState()

  if (!campaign && !scenario) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <p className="text-muted-foreground text-xs">No campaign loaded.<br />Use the chat to create or load one.</p>
      </div>
    )
  }

  const markedWeeks = campaign ? campaign.calendar.filter((w) => w.marked).length : 0
  const calendarPos = campaign ? getCalendarPosition(markedWeeks) : null
  const prosperityLevel = campaign ? getProsperityLevel(campaign.prosperityCheckmarks) : 0
  const moraleMod = campaign ? getMoraleDefenseModifier(campaign.morale) : 0

  const turnOrder = scenario
    ? getSortedTurnOrder(scenario.characters, scenario.monsterGroups, scenario.currentTurnIndex)
    : []

  const activeElements = scenario
    ? Object.entries(scenario.elements).filter(([, v]) => v !== 'inert')
    : []

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 text-xs">
      <div className="space-y-4">
        {campaign && (
          <>
            <div>
              <h2 className="text-sm font-bold">{campaign.name}</h2>
              {calendarPos && (
                <p className="text-muted-foreground text-[10px]">
                  Year {calendarPos.year} · {calendarPos.season} · week {calendarPos.weekInSeason}
                </p>
              )}
            </div>

            <Section title="Stats">
              <div className="space-y-1">
                <Stat label="Morale" value={`${campaign.morale} (${moraleMod >= 0 ? '+' : ''}${moraleMod} def)`} />
                <Stat label="Prosperity" value={`Lv ${prosperityLevel} (${campaign.prosperityCheckmarks} ✓)`} />
                <Stat label="Defense" value={campaign.totalDefense} />
                <Stat label="Soldiers" value={`${campaign.soldiers}/${campaign.barracksMaxSoldiers}`} />
                <Stat label="Inspiration" value={campaign.inspiration} />
              </div>
            </Section>

            <Section title="Resources">
              <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                {Object.entries(campaign.resources)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
              </div>
              {Object.values(campaign.resources).every((v) => v === 0) && (
                <p className="text-muted-foreground text-[10px] italic">None</p>
              )}
            </Section>

            <Section title="Party">
              <div className="space-y-1">
                {campaign.party.filter((c) => !c.retired).map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground ml-1">Lv{c.level} {c.className}</span>
                    </div>
                    <span className="text-muted-foreground">{c.maxHp} HP</span>
                  </div>
                ))}
                {campaign.party.filter((c) => !c.retired).length === 0 && (
                  <p className="text-muted-foreground text-[10px] italic">No characters</p>
                )}
              </div>
            </Section>

            {campaign.buildings.length > 0 && (
              <Section title="Buildings">
                <div className="space-y-0.5">
                  {campaign.buildings.map((b) => (
                    <div key={b.id} className="flex justify-between">
                      <span>{b.name}</span>
                      <span className="text-muted-foreground">
                        Lv{b.level}{b.status === 'wrecked' ? ' 🔥' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {scenario && (
          <>
            <div className="border-t pt-3">
              <h2 className="text-sm font-bold">Scenario: {scenario.name}</h2>
              <p className="text-muted-foreground text-[10px]">Round {scenario.round}</p>
            </div>

            {activeElements.length > 0 && (
              <Section title="Elements">
                <div className="flex flex-wrap gap-1">
                  {activeElements.map(([name, state]) => (
                    <Badge key={name} variant="element">
                      {name}: {state}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Characters">
              <div className="space-y-1.5">
                {scenario.characters.map((c) => (
                  <div key={c.id} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      <div className="flex items-center gap-2">
                        {c.initiative !== null && (
                          <span className="text-muted-foreground text-[10px]">init {c.initiative}</span>
                        )}
                        {c.longRest && <Badge>rest</Badge>}
                        <span className="text-muted-foreground text-[10px]">{c.xp} XP</span>
                      </div>
                    </div>
                    <HpBar current={c.currentHp} max={c.maxHp} />
                    <ConditionBadges conditions={c.conditions} />
                  </div>
                ))}
              </div>
            </Section>

            {scenario.monsterGroups.length > 0 && (
              <Section title="Monsters">
                <div className="space-y-2">
                  {scenario.monsterGroups.map((g) => {
                    const alive = g.standees.filter((s) => s.alive)
                    if (alive.length === 0) return null
                    return (
                      <div key={g.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{g.name}</span>
                          {g.initiative !== null && (
                            <span className="text-muted-foreground text-[10px]">init {g.initiative}</span>
                          )}
                        </div>
                        {alive.map((s) => {
                          const maxHp = s.rank === 'elite' ? g.maxHpElite : g.maxHpNormal
                          return (
                            <div key={s.id} className="ml-2 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">#{s.standeeNumber}</span>
                                <Badge variant={s.rank === 'elite' ? 'positive' : 'default'}>{s.rank}</Badge>
                              </div>
                              <HpBar current={s.currentHp} max={maxHp} />
                              <ConditionBadges conditions={s.conditions} />
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {turnOrder.length > 0 && turnOrder.some((e) => e.initiative !== null) && (
              <Section title="Turn Order">
                <div className="space-y-0.5">
                  {turnOrder.filter((e) => e.initiative !== null).map((e, i) => (
                    <div
                      key={e.id}
                      className={`flex items-center justify-between rounded px-1.5 py-0.5 ${
                        scenario.currentTurnIndex === i ? 'bg-primary/10 font-semibold' : ''
                      } ${e.hasActed ? 'text-muted-foreground line-through' : ''}`}
                    >
                      <span>{e.name}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {e.longRest ? 'rest' : e.initiative}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
