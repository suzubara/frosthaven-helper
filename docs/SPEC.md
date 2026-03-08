# Frosthaven Helper — Project Spec

## Overview

A local web app to help track game state while playing the board game **Frosthaven** (Cephalofair Games). The app replaces manual token/paper tracking with a digital interface, reducing table clutter and bookkeeping errors.

## Goals

- **Scenario phase tracking** — round counter, HP, conditions, elements, initiative for all figures
- **Campaign/outpost tracking** — calendar, resources, morale, prosperity, buildings, character progression
- **Local-first** — runs in the browser with no server; all data persists locally via IndexedDB
- **Multi-session** — save and resume campaigns and in-progress scenarios across play sessions

## Non-Goals (for now)

- Cloud sync or multi-device support
- Deployment to a hosted environment
- Mobile-native app (responsive web is fine)
- Digital recreation of game rules/enforcement (this is a tracker, not a rules engine)
- Undo/redo system

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) |
| Framework | React |
| Build | Vite |
| Routing | React Router |
| Testing | Vitest + Testing Library |
| Persistence | IndexedDB via `idb` |
| State management | React Context + `useReducer` |
| Package manager | pnpm |

## Architecture

```
src/
├── app/                  # App shell, router, layout
├── features/
│   ├── scenario/         # Scenario tracker (in-game phase)
│   ├── campaign/         # Campaign & outpost phase tracking
│   └── characters/       # Character creation & progression
├── data/                 # Static game reference data (JSON)
│   ├── conditions.ts
│   ├── elements.ts
│   └── classes/          # Starter class stats
├── db/                   # IndexedDB persistence layer
├── types/                # Shared TypeScript types
└── components/           # Shared UI components
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

### Slice 1: Scenario Tracker MVP

See [docs/features/scenario-tracker.md](./features/scenario-tracker.md)

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
