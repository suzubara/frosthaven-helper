# Frosthaven Helper — Project Spec

## Overview

A local web app to help track game state while playing the board game **Frosthaven** (Cephalofair Games). The app replaces manual token/paper tracking with a digital interface, reducing table clutter and bookkeeping errors.

## Goals

- **Scenario phase tracking** — round counter, HP, conditions, elements, initiative for all figures
- **Campaign/outpost tracking** — calendar, resources, morale, prosperity, buildings, character progression
- **Local-first** — runs in-browser with localStorage persistence; deployable as a static site
- **Multi-session** — save and resume campaigns and in-progress scenarios across play sessions
- **Portable** — import/export game state as JSON files for manual backup and cross-device transfer

## Non-Goals (for now)

- Cloud sync or automatic multi-device support
- Mobile-native app (responsive web is fine)
- Digital recreation of game rules/enforcement (this is a tracker, not a rules engine)
- Undo/redo system

## Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Language | TypeScript (strict) | ✅ |
| Framework | React 19 | ✅ |
| Build | Vite 7 | ✅ |
| Routing | React Router 7 | ✅ page routing active (`/`, `/scenario`, `/campaigns`, `/campaign/:id`) |
| Testing | Vitest + Testing Library | ✅ |
| Persistence | localStorage (browser) + JSON import/export | ✅ migrated from Express API |
| Deployment | Static site (GitHub Pages) | 🔄 planned |
| State management | React Context + `useReducer` | ✅ |
| UI | Tailwind CSS 4 + shadcn/ui components | ✅ |
| Package manager | pnpm | ✅ |

## Architecture

```
src/
├── storage/              # ✅ Persistence layer (localStorage wrappers)
│   ├── scenarios.ts      # ✅ (replaced src/api/scenarios.ts)
│   ├── campaigns.ts      # ✅
│   └── export.ts         # ✅ (JSON import/export helpers)
├── components/ui/        # Shared UI components (shadcn/ui)
│   ├── badge.tsx          # ✅
│   ├── button.tsx         # ✅
│   ├── card.tsx           # ✅
│   ├── input.tsx          # ✅
│   ├── label.tsx          # ✅
│   └── toggle.tsx         # ✅
├── data/                 # Static game reference data
│   ├── conditions.ts      # ✅
│   └── elements.ts        # ✅
├── features/
│   ├── scenario/         # ✅ Scenario tracker (in-game phase)
│   ├── campaign/         # ✅ Campaign & outpost phase tracking
│   ├── home/             # ✅ Home/landing page
│   └── characters/       # Character creation & progression (planned — Slice 4)
├── lib/
│   └── utils.ts          # ✅ cn() helper
├── types/
│   ├── scenario.ts       # ✅
│   └── campaign.ts       # ✅
├── App.tsx               # ✅ Layout shell with nav + <Outlet>
└── main.tsx              # ✅ Entry point with React Router
```

## Data Model Summary

### Campaign (persisted)

- Campaign name
- Campaign calendar (week, season, year)
- Frosthaven supply (resources, herbs)
- Morale (0–20), Prosperity track, Defense value, Soldiers, Inspiration
- Campaign stickers
- Scenario unlock/completion state
- Building states (unlocked, level, wrecked)
- Party roster (character references)

### Character (persisted)

- Name, class
- Level, XP, gold
- Personal resource supply
- Items (equipped + owned)
- Perks, checkmarks
- Personal quest
- Mastery progress
- Retired flag

### Scenario Session (persisted)

- Reference to campaign
- Scenario ID/name
- Round number
- Element board state
- Character states (current HP, XP earned this scenario, conditions, card state)
- Monster group states (type, per-standee: HP, conditions, normal/elite, alive)
- Ally/summon states

## Feature Slices

### Slice 1: Scenario Tracker MVP ✅

See [docs/features/scenario-tracker.md](./features/scenario-tracker.md) for detailed spec and acceptance criteria.

**Implemented:**
- Scenario setup form (name, characters, monster groups with standees)
- Round counter with element auto-decay
- Character HP/XP tracking with condition toggles
- Monster group tracking with per-standee HP, conditions, kill/spawn
- Element board (6 elements, click to toggle Strong/Inert, auto-decay on round advance)
- localStorage persistence (migrated from Express API) ✅
- Auto-save on every state change, auto-load latest session on mount
- Reducer with full test coverage (`scenarioReducer.test.ts`)
- UI built with Tailwind CSS + shadcn/ui components
- React Router page routing at `/scenario` ✅
- Accepts preloaded characters from campaign roster via `?campaignId=` query param ✅

**Not yet implemented from spec:**
- Resume/select from multiple saved sessions (auto-loads latest only)

### Slice 2: Initiative & Turn Order (next up)

See [docs/features/initiative-turn-order.md](./features/initiative-turn-order.md) for detailed spec and acceptance criteria.

- Initiative value entry (1–99) per character + monster group
- Long rest auto-sets initiative to 99
- Sorted turn order display with current turn highlighting
- Next/previous turn controls
- Round advance resets all initiative and turn state

### Slice 3: Campaign & Outpost Tracking ✅

See [docs/features/campaign-tracker.md](./features/campaign-tracker.md) for detailed spec and acceptance criteria.

**Implemented:**
- Create/load/delete campaigns with localStorage persistence
- Campaign calendar (80 boxes, season/year tracking, section numbers)
- Resource management (3 materials + 6 herbs)
- Morale (0–20) with defense modifier display
- Prosperity checkmarks with level + max starting character level
- Defense, soldiers, inspiration counters
- Building management (add/upgrade/wreck/rebuild)
- Party roster (add/edit/retire characters)
- Campaign notes & stickers
- Full reducer with test coverage (`campaignReducer.test.ts`)
- "Start Scenario with Party" integration
- Import/export game data (JSON backup/restore)
- Storybook stories for all campaign components

### Slice 4: Character Progression (planned)

- Character creation (pick class, name)
- Level up flow (XP thresholds)
- Perk/checkmark tracking
- Item management
- Retirement flow with retirement records (ADD_RETIREMENT reducer action exists, needs UI)

### Slice 5: Reference Data (planned)

- Starter class stat cards (Banner Spear, Drifter, Boneshaper, Deathwalker, Blinkblade, Geminate)
- Monster stat lookup by type + level
- Condition reference with rules summary

### Future Enhancements (backlog)

- **Character allies in scenarios** — support tracking allies alongside characters (HP, conditions) during a scenario
- **Data timestamps** — show when game data was last saved; show source file timestamp when importing from a backup
- **Autocomplete inputs** — combobox UI component for fields with known values (e.g. class names, monster types, building names) using suggested/existing values
