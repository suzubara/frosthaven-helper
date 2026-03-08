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

- Scenario state auto-saves to disk (JSON file) via the API on every state change
- Reload the page → state is hydrated from disk
- Can explicitly end/discard a scenario session (deletes the file)
- Saved files are human-readable and live in `game-data/scenarios/`

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

### Currently implemented (Slice 1)

- **Backend:** Express 5 server running alongside Vite dev server
- **Storage format:** One JSON file per scenario session at `game-data/scenarios/{id}.json`
- **Auto-save:** After every reducer dispatch, `PUT /api/scenarios/:id` writes the full `ScenarioSession` to disk
- **Load:** On app mount, `GET /api/scenarios` lists saved sessions; `GET /api/scenarios/:id` hydrates state
- **End session:** `DELETE /api/scenarios/:id` removes the file from disk
- **Files involved:** `src/api/scenarios.ts`, `server/index.ts`, `src/features/scenario/ScenarioContext.tsx`

### Changing in Slice 3

The persistence layer is moving from Express API → **localStorage** so the app can deploy as a static site. See [campaign-tracker.md](./campaign-tracker.md) for full details.

**What changes:**
- `src/api/scenarios.ts` → replaced by `src/storage/scenarios.ts` (same interface, localStorage backend)
- `ScenarioContext.tsx` → update imports to use new storage module
- `server/index.ts` → removed entirely
- `game-data/` directory → no longer used (existing files can be imported via import/export feature)

**What stays the same:**
- Auto-save after every reducer dispatch
- Same CRUD interface (save, load, list, delete)
- Same data shape (`ScenarioSession` type unchanged)

---

## Acceptance Criteria

- [x] Can create a new scenario session with a name, characters, and monster groups
- [x] Round counter increments/decrements correctly
- [x] Element board displays all 6 elements with correct states
- [x] Elements decay on round advance (Strong → Waning → Inert)
- [x] Can manually set element to Strong or Inert
- [x] Character HP increments/decrements, clamped to 0–maxHp
- [x] Character XP increments/decrements, minimum 0
- [x] Conditions can be toggled on/off per character
- [x] Monster standees track individual HP and conditions
- [x] Standees can be killed (marked dead, removed from active view)
- [x] New standees/groups can be added mid-scenario
- [x] State survives page reload (loaded from JSON file on disk)
- [x] Can end/discard a session
- [x] Visual indicators for exhausted characters and dead monsters

## Implementation Notes

### What was built

| Component | File | Description |
|---|---|---|
| Types | `src/types/scenario.ts` | All data types as specced |
| Reducer | `src/features/scenario/scenarioReducer.ts` | All actions implemented per spec |
| Tests | `src/features/scenario/scenarioReducer.test.ts` | Full coverage of all reducer actions |
| Context | `src/features/scenario/ScenarioContext.tsx` | Provider with auto-save/load via API |
| API client | `src/api/scenarios.ts` | Fetch wrappers for all CRUD endpoints |
| Server | `server/index.ts` | Express 5 API with file-based JSON persistence |
| Setup UI | `src/features/scenario/ScenarioSetup.tsx` | Form for creating new scenarios |
| Tracker UI | `src/features/scenario/ScenarioTracker.tsx` | Main tracker layout |
| Round | `src/features/scenario/RoundTracker.tsx` | Round increment/decrement |
| Elements | `src/features/scenario/ElementBoard.tsx` | 6-element grid with click-to-toggle |
| Characters | `src/features/scenario/CharacterCard.tsx` | HP/XP/conditions per character |
| Monsters | `src/features/scenario/MonsterGroupCard.tsx` | Group-level card with standee management |
| Standees | `src/features/scenario/MonsterStandeeRow.tsx` | Per-standee HP/conditions/kill |

### Deferred items

- React Router page routing (app uses conditional render in `App.tsx` instead)
- Session picker (auto-loads most recent session; no UI to choose from multiple)
- Ally/summon tracking
