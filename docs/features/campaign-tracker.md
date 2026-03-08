# Feature: Campaign & Outpost Tracker

> Slice 3 — campaign-level tracking between scenarios

## Overview

Track persistent campaign state on the Frosthaven campaign sheet: resources, morale, prosperity, defense, soldiers, inspiration, calendar, and buildings. This is the "between scenarios" companion to the Slice 1 scenario tracker.

**Scope note:** This slice focuses on _tracking values_ — not enforcing game rules. The app won't auto-resolve outpost events or enforce building prerequisites. It's a digital replacement for the paper campaign sheet.

---

## User Stories

### Campaign Management

- **As a player**, I can create a new campaign with a name
- **As a player**, I can load an existing campaign to continue tracking
- **As a player**, I can see a list of saved campaigns and pick one
- **As a player**, I can delete a campaign

### Campaign Calendar

- **As a player**, I can see the campaign calendar (80 boxes: 4 years × 2 seasons × 10 weeks)
- **As a player**, I can mark the next week (passage of time)
- **As a player**, I can see which season (summer/winter) and year I'm currently in
- **As a player**, I can add section numbers to future calendar boxes (e.g. "read section 42 in 3 weeks")
- **As a player**, I can see and resolve section numbers when marking a box

### Frosthaven Supply (Resources)

- **As a player**, I can track material resources: **lumber**, **metal**, **hide**
- **As a player**, I can track herb resources: **arrowvine**, **axenut**, **corpsecap**, **flamefruit**, **rockroot**, **snowthistle**
- **As a player**, I can increment/decrement each resource

### Morale

- **As a player**, I can track morale on a 0–20 scale
- **As a player**, I can see the current defense modifier from the morale track
- **As a player**, I can increment/decrement morale

### Prosperity

- **As a player**, I can track prosperity checkmarks
- **As a player**, I can see the current prosperity level (derived from checkmarks)
- **As a player**, I can add/remove checkmarks (numbered boxes cannot be erased)
- **As a player**, I can see the max starting character level (half prosperity, rounded up)

### Defense, Soldiers & Inspiration

- **As a player**, I can track the total defense value (integer, can be negative)
- **As a player**, I can track soldiers (0 to Barracks max)
- **As a player**, I can track inspiration (integer ≥ 0)

### Buildings

- **As a player**, I can see a list of buildings with their current state
- **As a player**, I can mark a building as: not built (L0), built (L1+), or wrecked
- **As a player**, I can upgrade a building's level
- **As a player**, I can wreck/rebuild a building
- **As a player**, I can add new buildings as they're unlocked

### Party Roster (Characters)

- **As a player**, I can add characters to the campaign roster (name, class, level, max HP)
- **As a player**, I can update a character's level and max HP between scenarios
- **As a player**, I can mark a character as retired
- **As a player**, I can remove a character from the roster
- **As a player**, when starting a scenario from a campaign, I can select characters from the roster to preload into the scenario (instead of entering them manually)
  - Preloaded characters carry over their name, class, and current max HP
  - Scenario-specific state (current HP, XP earned, conditions) resets fresh each scenario
- **As a player**, I can still add ad-hoc characters to a scenario that aren't in the campaign roster

### Campaign Notes

- **As a player**, I can record campaign stickers as text labels
- **As a player**, I can add free-form notes (scenario outcomes, reminders, etc.)

---

## Data Types

```typescript
// === Resources ===

type MaterialResource = 'lumber' | 'metal' | 'hide'
type HerbResource = 'arrowvine' | 'axenut' | 'corpsecap' | 'flamefruit' | 'rockroot' | 'snowthistle'
type ResourceType = MaterialResource | HerbResource

// === Calendar ===

type Season = 'summer' | 'winter'

interface CalendarWeek {
  marked: boolean
  sections: string[] // section numbers to read when this box is marked
}

// === Party Characters ===

interface PartyCharacter {
  id: string
  name: string
  className: string // e.g. "Banner Spear", "Drifter"
  level: number // 1–9
  maxHp: number // current max HP for their level
  retired: boolean
}

// === Buildings ===

type BuildingStatus = 'locked' | 'unlocked' | 'wrecked'

interface Building {
  id: string
  name: string
  level: number // 0 = unlocked but not built, 1+ = built level
  status: BuildingStatus
}

// === Prosperity ===

// Prosperity has checkmark boxes with numbered milestone boxes.
// Levels 1–9, with increasing checkmarks needed per level:
// Level 2: 4 checks, Level 3: 9, Level 4: 15, Level 5: 22,
// Level 6: 30, Level 7: 39, Level 8: 49, Level 9: 64

// === Morale → Defense Modifier ===

// Morale  | Defense Modifier
// 0–2     | -10
// 3–4     | -5
// 5–6     | -2
// 7–8     | -1
// 9–11    | 0
// 12–13   | +1
// 14–15   | +2
// 16–17   | +5
// 18–20   | +10

// === Campaign ===

interface Campaign {
  id: string
  name: string
  calendar: CalendarWeek[] // 80 entries (4 years × 20 weeks)
  resources: Record<ResourceType, number>
  morale: number // 0–20
  prosperityCheckmarks: number // total checkmarks filled
  totalDefense: number // can be negative
  soldiers: number
  barracksMaxSoldiers: number // determined by Barracks level
  inspiration: number
  buildings: Building[]
  party: PartyCharacter[]
  campaignStickers: string[]
  notes: string
  retirements: RetirementRecord[]
  createdAt: number
  updatedAt: number
}

interface RetirementRecord {
  characterName: string
  className: string
  level: number
  retiredAt: number // timestamp
}
```

---

## UI Wireframe (rough layout)

```
┌─────────────────────────────────────────────────────────┐
│  ← Campaigns            Frosthaven Campaign: "Group A"  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📅 Campaign Calendar                    Year 1 Summer  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [X][X][X][X][X][X][ ][ ][ ][ ] Summer Y1       │    │
│  │ [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ] Winter Y1       │    │
│  │ ...                                              │    │
│  └─────────────────────────────────────────────────┘    │
│  [Mark Next Week]                                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Frosthaven Supply                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ Materials             │  │ Herbs                │    │
│  │ 🪵 Lumber:  [−] 5 [+] │  │ 🌿 Arrowvine: [−] 2 [+] │
│  │ ⛏️ Metal:   [−] 3 [+] │  │ 🌿 Axenut:    [−] 1 [+] │
│  │ 🦴 Hide:    [−] 4 [+] │  │ 🌿 Corpsecap: [−] 0 [+] │
│  │                       │  │ 🌿 Flamefruit: [−] 3 [+] │
│  │                       │  │ 🌿 Rockroot:   [−] 1 [+] │
│  │                       │  │ 🌿 Snowthistle:[−] 2 [+] │
│  └──────────────────────┘  └──────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Outpost Stats                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐  │
│  │ Morale     │ │ Prosperity │ │ Defense            │  │
│  │ [−] 8 [+]  │ │ Level 2    │ │ Total: 3           │  │
│  │ Def mod: -1│ │ ████░░░░░  │ │ [−] [+]            │  │
│  │            │ │ 5/9 checks │ │                    │  │
│  └────────────┘ └────────────┘ └────────────────────┘  │
│  ┌────────────┐ ┌────────────┐                         │
│  │ Soldiers   │ │ Inspiration│                         │
│  │ [−] 4 [+]  │ │ [−] 7 [+]  │                         │
│  │ Max: 4     │ │            │                         │
│  └────────────┘ └────────────┘                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🏗️ Buildings                            [+ Add Building]│
│  ┌──────────────────────────────────────────────────┐  │
│  │ Craftsman      Level 1  ✅ Active    [Upgrade]   │  │
│  │ Alchemist      Level 2  ✅ Active    [Upgrade]   │  │
│  │ Barracks       Level 1  ✅ Active                │  │
│  │ Logging Camp   Level 1  💥 Wrecked   [Rebuild]   │  │
│  │ Mining Camp    L0       🔓 Unlocked  [Build]     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  👥 Party Roster                          [+ Add Character]│
│  ┌──────────────────────────────────────────────────┐  │
│  │ Brynn       Banner Spear  Level 3  HP 12  [Edit] │  │
│  │ Kael        Drifter       Level 2  HP 10  [Edit] │  │
│  │ Old Gregor  Boneshaper    Level 4  HP 8   🏛 Ret. │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  [▶ Start Scenario with Party]                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📝 Notes & Stickers                                    │
│  Stickers: [Ancient Technology] [Into the Forest]       │
│  Notes: [free-form text area]                           │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

Use `useReducer` with the following action types:

```typescript
type CampaignAction =
  // Session
  | { type: 'LOAD_CAMPAIGN'; campaign: Campaign }
  | { type: 'END_CAMPAIGN' }

  // Calendar
  | { type: 'MARK_WEEK' } // marks next unmarked box
  | { type: 'UNMARK_WEEK' } // unmarks last marked box
  | { type: 'ADD_CALENDAR_SECTION'; weekIndex: number; section: string }
  | { type: 'REMOVE_CALENDAR_SECTION'; weekIndex: number; section: string }

  // Resources
  | { type: 'UPDATE_RESOURCE'; resource: ResourceType; delta: number }

  // Morale
  | { type: 'UPDATE_MORALE'; delta: number } // clamped 0–20

  // Prosperity
  | { type: 'UPDATE_PROSPERITY'; delta: number } // add/remove checkmarks

  // Defense, Soldiers, Inspiration
  | { type: 'UPDATE_DEFENSE'; delta: number }
  | { type: 'UPDATE_SOLDIERS'; delta: number } // clamped 0–barracksMax
  | { type: 'UPDATE_INSPIRATION'; delta: number } // minimum 0

  // Buildings
  | { type: 'ADD_BUILDING'; building: Building }
  | { type: 'REMOVE_BUILDING'; buildingId: string }
  | { type: 'UPGRADE_BUILDING'; buildingId: string }
  | { type: 'WRECK_BUILDING'; buildingId: string }
  | { type: 'REBUILD_BUILDING'; buildingId: string }

  // Party
  | { type: 'ADD_CHARACTER'; character: PartyCharacter }
  | { type: 'REMOVE_CHARACTER'; characterId: string }
  | { type: 'UPDATE_CHARACTER'; characterId: string; updates: Partial<Pick<PartyCharacter, 'name' | 'className' | 'level' | 'maxHp'>> }
  | { type: 'RETIRE_CHARACTER'; characterId: string }

  // Notes & Stickers
  | { type: 'ADD_STICKER'; sticker: string }
  | { type: 'REMOVE_STICKER'; sticker: string }
  | { type: 'UPDATE_NOTES'; notes: string }

  // Retirements
  | { type: 'ADD_RETIREMENT'; record: RetirementRecord }

  // Barracks
  | { type: 'UPDATE_BARRACKS_MAX'; max: number }
```

---

## Routing

This slice introduces React Router page routing. The app will have:

```
/                → Home/landing page (campaign list + scenario list)
/campaign/:id    → Campaign tracker (this feature)
/scenario/:id    → Scenario tracker (existing, refactored from App.tsx)
```

The current `App.tsx` conditional render approach will be replaced with proper route-based navigation.

---

## Persistence Strategy

Same pattern as scenario tracker — new API routes and file storage:

```
game-data/
├── scenarios/
│   └── {session-id}.json
└── campaigns/
    └── {campaign-id}.json
```

**API routes:**

```
GET    /api/campaigns          # List all saved campaigns
GET    /api/campaigns/:id      # Load a full campaign
PUT    /api/campaigns/:id      # Create or update a campaign (upsert)
DELETE /api/campaigns/:id      # Delete a campaign
```

**Auto-save:** After every reducer dispatch, `PUT /api/campaigns/:id` writes the full `Campaign` to disk (same pattern as scenario tracker).

---

## Derived Values (computed, not stored)

These are calculated from stored state and displayed in the UI:

| Value | Derivation |
|---|---|
| Current season | Based on calendar position: weeks 1–10 = summer, 11–20 = winter per year |
| Current year | `Math.floor(markedWeeks / 20) + 1` |
| Current week in season | `(markedWeeks % 10) + 1` |
| Prosperity level | Lookup from checkmark total (see thresholds above) |
| Max starting character level | `Math.ceil(prosperityLevel / 2)` |
| Morale defense modifier | Lookup table from morale value |
| Effective defense | `totalDefense + moraleDefenseModifier` |

---

## Acceptance Criteria

- [ ] Can create a new campaign with a name
- [ ] Can load an existing campaign from a list
- [ ] Can delete a campaign
- [ ] Campaign calendar displays 80 boxes organized by season/year
- [ ] Can mark/unmark weeks on the calendar
- [ ] Current season and year are displayed correctly
- [ ] Can add section numbers to calendar boxes
- [ ] All 9 resource types can be incremented/decremented (min 0)
- [ ] Morale increments/decrements, clamped 0–20
- [ ] Morale defense modifier displays correctly
- [ ] Prosperity checkmarks can be added/removed
- [ ] Prosperity level and max character level display correctly
- [ ] Defense value can be adjusted (including negative)
- [ ] Soldiers can be adjusted, clamped to 0–barracks max
- [ ] Inspiration can be adjusted (min 0)
- [ ] Buildings can be added, upgraded, wrecked, and rebuilt
- [ ] Characters can be added to the party roster (name, class, level, max HP)
- [ ] Characters can be edited and retired
- [ ] "Start Scenario with Party" preloads active roster characters into scenario setup
- [ ] Ad-hoc characters can still be added during scenario setup alongside roster characters
- [ ] Campaign stickers can be added/removed
- [ ] Free-form notes can be edited
- [ ] Retirement records can be added
- [ ] State persists via JSON file on disk (same auto-save pattern)
- [ ] React Router routing works for `/`, `/campaign/:id`, `/scenario/:id`
- [ ] State survives page reload

---

## Implementation Plan

### Phase 1: Routing & Infrastructure

1. **Add React Router** to `main.tsx` with route definitions
2. **Refactor `App.tsx`** — move scenario flow to `/scenario` routes
3. **Create home/landing page** at `/` with links to campaigns and scenarios
4. **Add campaign API routes** to `server/index.ts` (CRUD for `game-data/campaigns/`)
5. **Add campaign API client** at `src/api/campaigns.ts`
6. **Add campaign types** at `src/types/campaign.ts`

### Phase 2: Campaign State & Core Reducer

7. **Create `campaignReducer.ts`** with all actions
8. **Write reducer tests** (`campaignReducer.test.ts`) — full coverage
9. **Create `CampaignContext.tsx`** with auto-save/load (same pattern as ScenarioContext)

### Phase 3: Campaign UI

10. **Campaign list page** — create/load/delete campaigns
11. **Campaign tracker layout** — main page with sections for each tracked area
12. **Resource tracking** — material + herb counters
13. **Morale tracking** — counter with defense modifier display
14. **Prosperity tracking** — checkmark progress bar with level indicator
15. **Defense/Soldiers/Inspiration** — simple counters
16. **Campaign calendar** — grid of boxes with season/year labels
17. **Buildings list** — add/upgrade/wreck/rebuild
18. **Party roster** — add/edit/retire characters
19. **Notes & stickers** — text inputs

### Phase 4: Scenario Integration & Polish

20. **"Start Scenario with Party"** — button on campaign page that navigates to scenario setup with roster characters preloaded
21. **Scenario setup refactor** — accept optional preloaded characters, allow adding/removing before starting
22. **Navigation** — header/nav bar for moving between campaign ↔ scenario
23. **Derived value display** — effective defense, max character level, etc.
