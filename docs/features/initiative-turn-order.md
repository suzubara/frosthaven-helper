# Feature: Initiative & Turn Order

> Slice 2 — initiative tracking and sorted turn order during scenarios

## Overview

Add initiative values to characters and monster groups during a scenario, then display a sorted turn order list. This helps players quickly see who goes next without manually sorting cards on the table.

**Scope note:** This is a tracking aid — the app doesn't know what ability cards are played or enforce timing rules. Players enter initiative values manually after card selection.

---

## User Stories

### Setting Initiative

- **As a player**, I can set an initiative value (1–99) for each character at the start of a round
- **As a player**, I can set an initiative value for each monster group (from the drawn ability card)
- **As a player**, I can mark a character as performing a **long rest** instead of entering an initiative, which auto-sets their initiative to 99
- **As a player**, I can clear/reset initiative values (e.g. if I entered the wrong number)

### Turn Order Display

- **As a player**, I can see all figures sorted by initiative (lowest goes first)
- **As a player**, I can see a visual indicator for whose turn it currently is
- **As a player**, I can advance to the next turn in the order
- **As a player**, I can go back to the previous turn (correction only)
- **As a player**, I can see at a glance which figures haven't acted yet vs. which are done

### Round Flow Integration

- **As a player**, when I advance to the next round, initiative values and turn position reset automatically
- **As a player**, figures without an initiative value set are shown at the end of the turn order (unsorted)
- **As a player**, ties in initiative are displayed in the order: characters first, then monster groups (per Frosthaven rules, the players choose tie-breaking order — the app just groups them)

---

## Data Types

```typescript
// Additions to existing types

// Added to CharacterState
interface CharacterState {
  // ... existing fields
  initiative: number | null  // null = not yet set for this round
  longRest: boolean          // true = performing long rest (initiative auto-set to 99)
}

// Added to MonsterGroup
interface MonsterGroup {
  // ... existing fields
  initiative: number | null  // null = not yet set for this round
}

// Added to ScenarioSession
interface ScenarioSession {
  // ... existing fields
  currentTurnIndex: number | null  // index into sorted turn order; null = round not started
}

// Derived (not stored)
interface TurnOrderEntry {
  id: string                         // character or monster group id
  name: string
  type: 'character' | 'monster'
  initiative: number | null
  longRest: boolean                  // only for characters
  hasActed: boolean                  // derived from currentTurnIndex
}
```

---

## State Management

New reducer actions added to `ScenarioAction`:

```typescript
type ScenarioAction =
  // ... existing actions

  // Initiative
  | { type: 'SET_CHARACTER_INITIATIVE'; characterId: string; initiative: number }
  | { type: 'SET_CHARACTER_LONG_REST'; characterId: string }
  | { type: 'CLEAR_CHARACTER_INITIATIVE'; characterId: string }
  | { type: 'SET_MONSTER_INITIATIVE'; groupId: string; initiative: number }
  | { type: 'CLEAR_MONSTER_INITIATIVE'; groupId: string }

  // Turn order
  | { type: 'START_ROUND' }         // locks initiative, sets currentTurnIndex to 0
  | { type: 'NEXT_TURN' }           // advances currentTurnIndex
  | { type: 'PREVIOUS_TURN' }       // decrements currentTurnIndex (min 0)
```

### Round Lifecycle Changes

The existing `ADVANCE_ROUND` action will be updated to:
1. Increment the round counter
2. Decay elements (existing behavior)
3. Reset all initiative values to `null`
4. Reset `longRest` to `false` for all characters
5. Reset `currentTurnIndex` to `null`

---

## Derived Values

| Value | Derivation |
|---|---|
| Sorted turn order | All figures sorted by initiative (ascending). `null` initiative goes last. Characters sort before monsters on ties. |
| Current turn figure | `turnOrder[currentTurnIndex]` |
| Has acted | `turnOrder` entries where index < `currentTurnIndex` |
| Round started | `currentTurnIndex !== null` |
| All turns complete | `currentTurnIndex >= turnOrder.length` |

### Sort helper

```typescript
function getSortedTurnOrder(
  characters: CharacterState[],
  monsterGroups: MonsterGroup[],
): TurnOrderEntry[] {
  const entries: TurnOrderEntry[] = [
    ...characters.map((c) => ({
      id: c.id,
      name: c.name,
      type: 'character' as const,
      initiative: c.longRest ? 99 : c.initiative,
      longRest: c.longRest,
      hasActed: false,
    })),
    ...monsterGroups.map((g) => ({
      id: g.id,
      name: g.name,
      type: 'monster' as const,
      initiative: g.initiative,
      longRest: false,
      hasActed: false,
    })),
  ]

  return entries.sort((a, b) => {
    // Figures without initiative go last
    if (a.initiative === null && b.initiative === null) return 0
    if (a.initiative === null) return 1
    if (b.initiative === null) return -1

    // Sort by initiative ascending
    if (a.initiative !== b.initiative) return a.initiative - b.initiative

    // Tie: characters before monsters
    if (a.type !== b.type) return a.type === 'character' ? -1 : 1

    return 0
  })
}
```

---

## UI Wireframe (rough layout)

```
┌─────────────────────────────────────────────────────────┐
│  Scenario: "Scenario 1"          Round: 3   [End]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚔️ Turn Order                    [Start Round]          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ✅ 07  Brynn (character)                         │   │
│  │ ✅ 12  Living Bones (monster)                    │   │
│  │ ▶️ 28  Kael (character)              ← current   │   │
│  │ ○  45  Bandit Guards (monster)                   │   │
│  │ ○  99  Mira (character) 💤 long rest             │   │
│  │ ○  --  Bandit Archers (monster)  ← no init set   │   │
│  └──────────────────────────────────────────────────┘   │
│  [◀ Previous]  [Next ▶]                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Set Initiative                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Brynn:          [__07__]  [Long Rest]            │   │
│  │ Kael:           [__28__]  [Long Rest]            │   │
│  │ Mira:           99 💤     [Cancel Rest]          │   │
│  │ Living Bones:   [__12__]                         │   │
│  │ Bandit Guards:  [__45__]                         │   │
│  │ Bandit Archers: [______]                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🔥 Element Board     (existing, unchanged)             │
├─────────────────────────────────────────────────────────┤
│  👤 Characters          (existing cards, unchanged)     │
├─────────────────────────────────────────────────────────┤
│  👹 Monster Groups      (existing cards, unchanged)     │
└─────────────────────────────────────────────────────────┘
```

### Layout Notes

- **Turn Order panel** sits between the header/round tracker and the element board
- **Initiative inputs** can be inline in the turn order panel or a separate collapsible section — design TBD during implementation
- The existing character and monster cards remain unchanged — initiative is managed in the turn order panel, not on individual cards
- When all turns are complete, show a prompt to advance to the next round

---

## Acceptance Criteria

- [x] Can set initiative (1–99) for each character
- [x] Can set initiative for each monster group
- [x] Can mark a character as long resting (initiative auto-set to 99)
- [x] Can clear/reset a character's or monster's initiative
- [x] Turn order displays all figures sorted by initiative (ascending)
- [x] Figures without initiative appear at the bottom
- [x] Ties show characters before monsters
- [x] Can start the round (locks turn order, highlights first figure)
- [x] Can advance to next turn
- [x] Can go back to previous turn
- [x] Current turn is visually highlighted
- [x] Acted figures are visually distinct from pending figures
- [x] Advancing round resets all initiative values, long rest flags, and turn position
- [x] Turn order state persists via existing auto-save
- [x] Initiative inputs accept numeric values only
- [x] Long rest characters show a visual indicator (💤 or similar)

---

## Implementation Plan

### Phase 1: Data Model & Reducer ✅

1. ✅ **Update `ScenarioSession` type** — added `currentTurnIndex` field
2. ✅ **Update `CharacterState` type** — added `initiative` and `longRest` fields
3. ✅ **Update `MonsterGroup` type** — added `initiative` field
4. ✅ **Add new reducer actions** — initiative set/clear, turn order navigation
5. ✅ **Update `ADVANCE_ROUND`** — resets initiative, longRest, currentTurnIndex
6. ✅ **Update `ScenarioSetup`** — initializes new fields when creating a session
7. ✅ **Write reducer tests** — full coverage for new actions

### Phase 2: Turn Order Logic ✅

8. ✅ **Create `turnOrder.ts`** — `getSortedTurnOrder()` helper + tests (`turnOrder.test.ts`)
9. ✅ **Create `TurnOrderPanel` component** — sorted list with current turn highlighting

### Phase 3: Initiative Input UI ✅

10. ✅ **Create `InitiativeInput` component** — number input for initiative per figure
11. ✅ **Add long rest toggle** for characters
12. ✅ **Wire into `ScenarioTracker`** — turn order panel and initiative inputs in layout

### Phase 4: Polish ✅

13. ✅ **"All turns complete" prompt** — "Next Round →" button appears when all turns done
14. ✅ **Visual polish** — acted (✅ + dimmed), current (▶️ + ring), pending (○) states, 💤 long rest indicator
15. ✅ **Storybook stories** — `TurnOrderPanel.stories.tsx`, `InitiativeInput.stories.tsx`
