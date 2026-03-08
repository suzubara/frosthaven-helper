# Feature: Scenario Tracker MVP

> Slice 1 — the core in-game tracking experience

## User Stories

### Starting a Scenario

- **As a player**, I can create a new scenario session so I can begin tracking a game
  - Enter a scenario name/number
  - Add characters (name + max HP)
  - Add monster groups (type name, normal/elite standee count, max HP per rank)
- **As a player**, I can resume a previously saved scenario session

### Round Tracking

- **As a player**, I can see the current round number
- **As a player**, I can advance to the next round
  - Advancing a round triggers element decay (Strong → Waning → Inert)
- **As a player**, I can go back a round (correction only — no state rollback, just the counter)

### Character Tracking

- **As a player**, I can track each character's current HP
  - Increment/decrement buttons
  - Visual indicator when HP is low (≤ 25% max)
  - Visual indicator when character is exhausted (0 HP)
- **As a player**, I can track XP earned this scenario per character
- **As a player**, I can toggle conditions on/off for each character

### Monster Tracking

- **As a player**, I can track each monster group with individual standees
  - Each standee has: number (1–10), rank (normal/elite), current HP, conditions
  - Standees can be marked as dead (removes from active tracking)
- **As a player**, I can add or remove standees mid-scenario (spawns/summons/deaths)
- **As a player**, I can add new monster groups mid-scenario (new rooms revealed)

### Element Board

- **As a player**, I can see all 6 elements and their current state
  - Elements: Fire, Ice, Air, Earth, Light, Dark
  - States: Inert (default), Strong, Waning
- **As a player**, I can set an element to Strong (when infused)
- **As a player**, I can consume an element (set to Inert)
- Elements automatically decay at end of round: Strong → Waning, Waning → Inert

### Persistence

- Scenario state auto-saves to IndexedDB on every state change
- Reload the page → state is preserved
- Can explicitly end/discard a scenario session

---

## Data Types

```typescript
type ElementName = 'fire' | 'ice' | 'air' | 'earth' | 'light' | 'dark'
type ElementState = 'inert' | 'strong' | 'waning'

type Condition =
  // Negative
  | 'poison'
  | 'wound'
  | 'brittle'
  | 'bane'
  | 'stun'
  | 'muddle'
  | 'immobilize'
  | 'disarm'
  | 'impair'
  // Positive
  | 'strengthen'
  | 'invisible'
  | 'regenerate'
  | 'ward'

type MonsterRank = 'normal' | 'elite' | 'boss'

interface ScenarioSession {
  id: string
  name: string                          // e.g. "Scenario 1 - Roadside Ambush"
  round: number
  elements: Record<ElementName, ElementState>
  characters: CharacterState[]
  monsterGroups: MonsterGroup[]
  createdAt: number                     // timestamp
  updatedAt: number                     // timestamp
}

interface CharacterState {
  id: string
  name: string
  maxHp: number
  currentHp: number
  xp: number
  conditions: Condition[]
}

interface MonsterGroup {
  id: string
  name: string                          // e.g. "Living Bones"
  maxHpNormal: number
  maxHpElite: number
  standees: MonsterStandee[]
}

interface MonsterStandee {
  id: string
  standeeNumber: number                 // 1–10
  rank: MonsterRank
  currentHp: number
  conditions: Condition[]
  alive: boolean
}
```

---

## UI Wireframe (rough layout)

```
┌─────────────────────────────────────────────────────┐
│  Scenario: #1 Roadside Ambush         Round: [ 3 ]  │
│                                       [< Round >]   │
├─────────────────────────────────────────────────────┤
│  Element Board                                      │
│  [🔥 Strong] [❄️ Inert] [💨 Waning]                 │
│  [🌍 Inert]  [☀️ Inert] [🌑 Strong]                 │
├─────────────────────────────────────────────────────┤
│  Characters                                         │
│  ┌──────────────────────────────────┐               │
│  │ Brynn (Banner Spear)            │               │
│  │ HP: [−] 8/10 [+]   XP: [−] 4 [+]│               │
│  │ Conditions: [Poison ✓] [Muddle]  │               │
│  └──────────────────────────────────┘               │
│  ┌──────────────────────────────────┐               │
│  │ Kael (Drifter)                  │               │
│  │ HP: [−] 12/12 [+]  XP: [−] 2 [+]│               │
│  │ Conditions: (none)               │               │
│  └──────────────────────────────────┘               │
├─────────────────────────────────────────────────────┤
│  Monster Groups                     [+ Add Group]   │
│  ┌──────────────────────────────────┐               │
│  │ Living Bones                     │               │
│  │ #1 (N) HP: 3/5  [Poison]   [☠️]  │               │
│  │ #2 (E) HP: 7/9  (none)    [☠️]  │               │
│  │ #3 (N) HP: 💀 dead              │               │
│  │                    [+ Standee]   │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

---

## State Management

Use `useReducer` with the following action types:

```typescript
type ScenarioAction =
  // Round
  | { type: 'ADVANCE_ROUND' }
  | { type: 'REWIND_ROUND' }

  // Elements
  | { type: 'SET_ELEMENT'; element: ElementName; state: ElementState }
  | { type: 'DECAY_ELEMENTS' }            // triggered by ADVANCE_ROUND

  // Characters
  | { type: 'ADD_CHARACTER'; character: CharacterState }
  | { type: 'REMOVE_CHARACTER'; characterId: string }
  | { type: 'UPDATE_CHARACTER_HP'; characterId: string; delta: number }
  | { type: 'UPDATE_CHARACTER_XP'; characterId: string; delta: number }
  | { type: 'TOGGLE_CHARACTER_CONDITION'; characterId: string; condition: Condition }

  // Monsters
  | { type: 'ADD_MONSTER_GROUP'; group: MonsterGroup }
  | { type: 'REMOVE_MONSTER_GROUP'; groupId: string }
  | { type: 'ADD_STANDEE'; groupId: string; standee: MonsterStandee }
  | { type: 'UPDATE_STANDEE_HP'; groupId: string; standeeId: string; delta: number }
  | { type: 'TOGGLE_STANDEE_CONDITION'; groupId: string; standeeId: string; condition: Condition }
  | { type: 'KILL_STANDEE'; groupId: string; standeeId: string }

  // Session
  | { type: 'LOAD_SESSION'; session: ScenarioSession }
  | { type: 'END_SESSION' }
```

---

## Persistence Strategy

- **Auto-save:** After every reducer dispatch, persist the full `ScenarioSession` to IndexedDB
- **IndexedDB schema:**
  - Store: `scenarios`
  - Key: `session.id`
  - Value: full `ScenarioSession` object
- **Load:** On app mount, check for an active session and hydrate state
- **End session:** Remove from IndexedDB (or mark as completed)

---

## Acceptance Criteria

- [ ] Can create a new scenario session with a name, characters, and monster groups
- [ ] Round counter increments/decrements correctly
- [ ] Element board displays all 6 elements with correct states
- [ ] Elements decay on round advance (Strong → Waning → Inert)
- [ ] Can manually set element to Strong or Inert
- [ ] Character HP increments/decrements, clamped to 0–maxHp
- [ ] Character XP increments/decrements, minimum 0
- [ ] Conditions can be toggled on/off per character
- [ ] Monster standees track individual HP and conditions
- [ ] Standees can be killed (marked dead, removed from active view)
- [ ] New standees/groups can be added mid-scenario
- [ ] State survives page reload (IndexedDB persistence)
- [ ] Can end/discard a session
- [ ] Visual indicators for exhausted characters and dead monsters
