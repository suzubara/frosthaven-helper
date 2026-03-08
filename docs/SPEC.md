# Frosthaven Helper — Project Spec

## Overview

A local web app to help track game state while playing the board game **Frosthaven** (Cephalofair Games). The app replaces manual token/paper tracking with a digital interface, reducing table clutter and bookkeeping errors.

## Goals

- **Scenario phase tracking** — round counter, HP, conditions, elements, initiative for all figures
- **Campaign/outpost tracking** — calendar, resources, morale, prosperity, buildings, character progression
- **Local-first** — runs locally with a thin Express API; game state persists as JSON files on disk
- **Multi-session** — save and resume campaigns and in-progress scenarios across play sessions

## Non-Goals (for now)

- Cloud sync or multi-device support
- Deployment to a hosted environment
- Mobile-native app (responsive web is fine)
- Digital recreation of game rules/enforcement (this is a tracker, not a rules engine)
- Undo/redo system

## Tech Stack

| Layer | Choice | Status |
|---|---|---|
| Language | TypeScript (strict) | ✅ |
| Framework | React 19 | ✅ |
| Build | Vite 7 | ✅ |
| Routing | React Router 7 | ✅ installed, not yet used for page routing |
| Testing | Vitest + Testing Library | ✅ |
| Persistence | JSON files on disk via Express API | ✅ |
| Backend | Express 5 (lightweight local API server) | ✅ |
| State management | React Context + `useReducer` | ✅ |
| UI | Tailwind CSS 4 + shadcn/ui components | ✅ |
| Package manager | pnpm | ✅ |

## Architecture

```
src/
├── api/                  # Client-side API helpers (fetch wrappers)
│   └── scenarios.ts      # ✅
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
│   ├── scenario/         # Scenario tracker (in-game phase) ✅
│   ├── campaign/         # Campaign & outpost phase tracking (planned)
│   └── characters/       # Character creation & progression (planned)
├── lib/
│   └── utils.ts          # ✅ cn() helper
├── types/
│   └── scenario.ts       # ✅
├── App.tsx               # ✅ Root component (setup ↔ tracker flow)
└── main.tsx              # ✅ Entry point

server/
└── index.ts              # ✅ Express API (scenarios CRUD + file persistence)

game-data/                # Persisted game state (JSON files, gitignored)
└── scenarios/
    └── {session-id}.json
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
- Express API with JSON file persistence (`game-data/scenarios/`)
- Auto-save on every state change, auto-load latest session on mount
- Reducer with full test coverage (`scenarioReducer.test.ts`)
- UI built with Tailwind CSS + shadcn/ui components

**Not yet implemented from spec:**
- React Router page routing (currently single-page conditional render)
- Resume/select from multiple saved sessions (auto-loads latest only)

### Slice 2: Initiative & Turn Order (planned)

- Initiative value entry per character + monster group
- Sorted turn order display
- Current turn indicator with next/previous controls
- Long rest auto-sets initiative to 99

### Slice 3: Campaign & Outpost Tracking (planned)

- Create/load campaign
- Campaign calendar with season tracking
- Resource management (Frosthaven supply)
- Morale, prosperity, defense, soldiers, inspiration tracking
- Scenario unlock/completion map
- Building management

### Slice 4: Character Progression (planned)

- Character creation (pick class, name)
- Level up flow (XP thresholds)
- Perk/checkmark tracking
- Item management
- Retirement flow

### Slice 5: Reference Data (planned)

- Starter class stat cards (Banner Spear, Drifter, Boneshaper, Deathwalker, Blinkblade, Geminate)
- Monster stat lookup by type + level
- Condition reference with rules summary
