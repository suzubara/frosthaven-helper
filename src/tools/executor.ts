import type { Campaign, ResourceType } from '@/types/campaign'
import type {
  CharacterState,
  Condition,
  ElementName,
  ElementState,
  MonsterRank,
  ScenarioSession,
} from '@/types/scenario'
import {
  getProsperityLevel,
  getCalendarPosition,
  getMoraleDefenseModifier,
} from '@/features/campaign/campaignReducer'
import { getSortedTurnOrder } from '@/features/scenario/turnOrder'
import { createDefaultElements } from '@/data/elements'
import { listCampaigns, saveCampaign } from '@/storage/campaigns'
import {
  getCampaignState,
  getScenarioState,
  dispatchCampaign,
  dispatchScenario,
  loadCampaignByName,
} from './state'

export function executeTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    // --- Campaign read ---

    case 'list_campaigns': {
      const campaigns = listCampaigns()
      if (campaigns.length === 0) return 'No campaigns found.'
      return JSON.stringify(
        campaigns.map((c) => ({ id: c.id, name: c.name, updatedAt: c.updatedAt })),
      )
    }

    case 'load_campaign': {
      const campaign = loadCampaignByName(args.name as string)
      if (!campaign) return `Error: No campaign found with name "${args.name}".`
      return `Loaded campaign "${campaign.name}".`
    }

    case 'get_campaign_status': {
      const c = getCampaignState()
      if (!c) return 'Error: No campaign loaded.'
      const prosperityLevel = getProsperityLevel(c.prosperityCheckmarks)
      const calendarPos = getCalendarPosition(
        c.calendar.filter((w) => w.marked).length,
      )
      const moraleMod = getMoraleDefenseModifier(c.morale)
      return JSON.stringify({
        name: c.name,
        calendar: `Year ${calendarPos.year}, ${calendarPos.season} week ${calendarPos.weekInSeason}`,
        resources: c.resources,
        morale: c.morale,
        moraleDefenseModifier: moraleMod,
        prosperityLevel,
        prosperityCheckmarks: c.prosperityCheckmarks,
        totalDefense: c.totalDefense,
        soldiers: `${c.soldiers}/${c.barracksMaxSoldiers}`,
        inspiration: c.inspiration,
        buildings: c.buildings.map((b) => ({
          name: b.name,
          level: b.level,
          status: b.status,
        })),
        party: c.party
          .filter((p) => !p.retired)
          .map((p) => ({
            name: p.name,
            className: p.className,
            level: p.level,
            maxHp: p.maxHp,
          })),
        retirements: c.retirements.length,
        notes: c.notes || '(none)',
      })
    }

    // --- Campaign mutations ---

    case 'create_campaign': {
      const now = Date.now()
      const campaign: Campaign = {
        id: crypto.randomUUID(),
        name: args.name as string,
        calendar: Array.from({ length: 60 }, () => ({ marked: false, sections: [] })),
        resources: {
          lumber: 0, metal: 0, hide: 0,
          arrowvine: 0, axenut: 0, corpsecap: 0,
          flamefruit: 0, rockroot: 0, snowthistle: 0,
        },
        morale: 10,
        prosperityCheckmarks: 0,
        totalDefense: 0,
        soldiers: 0,
        barracksMaxSoldiers: 4,
        inspiration: 0,
        buildings: [],
        party: [],
        campaignStickers: [],
        notes: '',
        retirements: [],
        createdAt: now,
        updatedAt: now,
      }
      saveCampaign(campaign)
      dispatchCampaign({ type: 'LOAD_CAMPAIGN', campaign })
      return `Created and loaded campaign "${campaign.name}".`
    }

    case 'update_resource': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({
        type: 'UPDATE_RESOURCE',
        resource: args.resource as ResourceType,
        delta: args.delta as number,
      })
      const c = getCampaignState()!
      return `${args.resource}: ${c.resources[args.resource as ResourceType]}`
    }

    case 'update_morale': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'UPDATE_MORALE', delta: args.delta as number })
      return `Morale: ${getCampaignState()!.morale}`
    }

    case 'update_prosperity': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'UPDATE_PROSPERITY', delta: args.delta as number })
      const c = getCampaignState()!
      return `Prosperity checkmarks: ${c.prosperityCheckmarks} (level ${getProsperityLevel(c.prosperityCheckmarks)})`
    }

    case 'update_defense': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'UPDATE_DEFENSE', delta: args.delta as number })
      return `Total defense: ${getCampaignState()!.totalDefense}`
    }

    case 'update_soldiers': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'UPDATE_SOLDIERS', delta: args.delta as number })
      const c = getCampaignState()!
      return `Soldiers: ${c.soldiers}/${c.barracksMaxSoldiers}`
    }

    case 'update_inspiration': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'UPDATE_INSPIRATION', delta: args.delta as number })
      return `Inspiration: ${getCampaignState()!.inspiration}`
    }

    case 'mark_week': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'MARK_WEEK' })
      const c = getCampaignState()!
      const markedCount = c.calendar.filter((w) => w.marked).length
      const pos = getCalendarPosition(markedCount)
      return `Marked week ${markedCount}. Now in Year ${pos.year}, ${pos.season} week ${pos.weekInSeason}.`
    }

    case 'add_building': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({
        type: 'ADD_BUILDING',
        building: {
          id: crypto.randomUUID(),
          name: args.name as string,
          level: (args.level as number) ?? 1,
          status: 'unlocked',
        },
      })
      return `Added building "${args.name}".`
    }

    case 'upgrade_building': {
      const c = getCampaignState()
      if (!c) return 'Error: No campaign loaded.'
      const building = c.buildings.find(
        (b) => b.name.toLowerCase() === (args.name as string).toLowerCase(),
      )
      if (!building) return `Error: No building named "${args.name}" found.`
      dispatchCampaign({ type: 'UPGRADE_BUILDING', buildingId: building.id })
      return `Upgraded "${building.name}" to level ${building.level + 1}.`
    }

    case 'add_character': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({
        type: 'ADD_CHARACTER',
        character: {
          id: crypto.randomUUID(),
          name: args.name as string,
          className: args.className as string,
          level: args.level as number,
          maxHp: args.maxHp as number,
          retired: false,
        },
      })
      return `Added ${args.name} (${args.className}) to the party.`
    }

    case 'update_character': {
      const c = getCampaignState()
      if (!c) return 'Error: No campaign loaded.'
      const char = c.party.find(
        (p) => p.name.toLowerCase() === (args.name as string).toLowerCase(),
      )
      if (!char) return `Error: No character named "${args.name}" in the party.`
      dispatchCampaign({
        type: 'UPDATE_CHARACTER',
        characterId: char.id,
        updates: args.updates as { level?: number; maxHp?: number },
      })
      return `Updated ${char.name}.`
    }

    case 'retire_character': {
      const c = getCampaignState()
      if (!c) return 'Error: No campaign loaded.'
      const char = c.party.find(
        (p) => p.name.toLowerCase() === (args.name as string).toLowerCase(),
      )
      if (!char) return `Error: No character named "${args.name}" in the party.`
      dispatchCampaign({ type: 'RETIRE_CHARACTER', characterId: char.id })
      dispatchCampaign({
        type: 'ADD_RETIREMENT',
        record: {
          characterName: char.name,
          className: char.className,
          level: char.level,
          retiredAt: Date.now(),
        },
      })
      return `Retired ${char.name} (${char.className}, level ${char.level}).`
    }

    case 'update_notes': {
      if (!getCampaignState()) return 'Error: No campaign loaded.'
      dispatchCampaign({ type: 'UPDATE_NOTES', notes: args.notes as string })
      return 'Notes updated.'
    }

    // --- Scenario read ---

    case 'get_scenario_status': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      return JSON.stringify({
        name: s.name,
        round: s.round,
        elements: s.elements,
        characters: s.characters.map((c) => ({
          name: c.name,
          hp: `${c.currentHp}/${c.maxHp}`,
          xp: c.xp,
          conditions: c.conditions,
          initiative: c.initiative,
          longRest: c.longRest,
        })),
        monsterGroups: s.monsterGroups.map((g) => ({
          name: g.name,
          initiative: g.initiative,
          standees: g.standees
            .filter((st) => st.alive)
            .map((st) => ({
              number: st.standeeNumber,
              rank: st.rank,
              hp: `${st.currentHp}/${st.rank === 'elite' ? g.maxHpElite : g.maxHpNormal}`,
              conditions: st.conditions,
            })),
        })),
      })
    }

    case 'get_turn_order': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      const order = getSortedTurnOrder(s.characters, s.monsterGroups, s.currentTurnIndex)
      return JSON.stringify(
        order.map((e) => ({
          name: e.name,
          type: e.type,
          initiative: e.initiative,
          longRest: e.longRest,
          hasActed: e.hasActed,
        })),
      )
    }

    // --- Scenario mutations ---

    case 'start_scenario': {
      const campaign = getCampaignState()
      const characters: CharacterState[] = campaign
        ? campaign.party
            .filter((p) => !p.retired)
            .map((p) => ({
              id: crypto.randomUUID(),
              name: p.name,
              maxHp: p.maxHp,
              currentHp: p.maxHp,
              xp: 0,
              conditions: [],
              initiative: null,
              longRest: false,
            }))
        : []
      const session: ScenarioSession = {
        id: crypto.randomUUID(),
        name: args.name as string,
        round: 1,
        elements: createDefaultElements(),
        characters,
        monsterGroups: [],
        currentTurnIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      dispatchScenario({ type: 'LOAD_SESSION', session })
      const charSummary = characters.length > 0
        ? ` with ${characters.map((c) => c.name).join(', ')}`
        : ''
      return `Started scenario "${args.name}"${charSummary}.`
    }

    case 'end_scenario': {
      if (!getScenarioState()) return 'Error: No scenario in progress.'
      dispatchScenario({ type: 'END_SESSION' })
      return 'Scenario ended.'
    }

    case 'advance_round': {
      if (!getScenarioState()) return 'Error: No scenario in progress.'
      dispatchScenario({ type: 'ADVANCE_ROUND' })
      return `Round ${getScenarioState()!.round}.`
    }

    case 'set_element': {
      if (!getScenarioState()) return 'Error: No scenario in progress.'
      dispatchScenario({
        type: 'SET_ELEMENT',
        element: args.element as ElementName,
        state: args.state as ElementState,
      })
      return `${args.element} is now ${args.state}.`
    }

    case 'add_monster_group': {
      if (!getScenarioState()) return 'Error: No scenario in progress.'
      dispatchScenario({
        type: 'ADD_MONSTER_GROUP',
        group: {
          id: crypto.randomUUID(),
          name: args.name as string,
          maxHpNormal: args.maxHpNormal as number,
          maxHpElite: args.maxHpElite as number,
          standees: [],
          initiative: null,
        },
      })
      return `Added monster group "${args.name}".`
    }

    case 'add_standee': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      const group = s.monsterGroups.find(
        (g) => g.name.toLowerCase() === (args.groupName as string).toLowerCase(),
      )
      if (!group) return `Error: No monster group named "${args.groupName}".`
      const rank = args.rank as MonsterRank
      const maxHp = rank === 'elite' ? group.maxHpElite : group.maxHpNormal
      dispatchScenario({
        type: 'ADD_STANDEE',
        groupId: group.id,
        standee: {
          id: crypto.randomUUID(),
          standeeNumber: args.standeeNumber as number,
          rank,
          currentHp: maxHp,
          conditions: [],
          alive: true,
        },
      })
      return `Added ${rank} ${group.name} #${args.standeeNumber} (${maxHp} HP).`
    }

    case 'damage_entity': {
      return applyHpChange(args.name as string, -(args.amount as number))
    }

    case 'heal_entity': {
      return applyHpChange(args.name as string, args.amount as number)
    }

    case 'toggle_condition': {
      return applyConditionToggle(args.name as string, args.condition as Condition)
    }

    case 'kill_standee': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      const group = s.monsterGroups.find(
        (g) => g.name.toLowerCase() === (args.groupName as string).toLowerCase(),
      )
      if (!group) return `Error: No monster group named "${args.groupName}".`
      const standee = group.standees.find(
        (st) => st.standeeNumber === (args.standeeNumber as number) && st.alive,
      )
      if (!standee) return `Error: No alive standee #${args.standeeNumber} in "${group.name}".`
      dispatchScenario({
        type: 'KILL_STANDEE',
        groupId: group.id,
        standeeId: standee.id,
      })
      return `Killed ${group.name} #${standee.standeeNumber}.`
    }

    case 'set_initiative': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      const initiative = args.initiative as number
      const nameStr = (args.name as string).toLowerCase()

      const char = s.characters.find((c) => c.name.toLowerCase() === nameStr)
      if (char) {
        dispatchScenario({
          type: 'SET_CHARACTER_INITIATIVE',
          characterId: char.id,
          initiative,
        })
        return `${char.name} initiative set to ${initiative}.`
      }

      const group = s.monsterGroups.find((g) => g.name.toLowerCase() === nameStr)
      if (group) {
        dispatchScenario({
          type: 'SET_MONSTER_INITIATIVE',
          groupId: group.id,
          initiative,
        })
        return `${group.name} initiative set to ${initiative}.`
      }

      return `Error: No character or monster group named "${args.name}".`
    }

    case 'next_turn': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      const order = getSortedTurnOrder(s.characters, s.monsterGroups, s.currentTurnIndex)
      const currentIdx = s.currentTurnIndex ?? 0
      const current = order[currentIdx]
      if (!current) return 'Error: No more turns this round.'
      dispatchScenario({
        type: 'NEXT_TURN',
        entityId: current.id,
        entityType: current.type,
      })
      const nextIdx = currentIdx + 1
      const next = order[nextIdx]
      if (next) {
        return `${current.name}'s turn ended. Now: ${next.name} (${next.type}, initiative ${next.initiative}).`
      }
      return `${current.name}'s turn ended. All turns complete for this round.`
    }

    case 'update_xp': {
      const s = getScenarioState()
      if (!s) return 'Error: No scenario in progress.'
      const char = s.characters.find(
        (c) => c.name.toLowerCase() === (args.name as string).toLowerCase(),
      )
      if (!char) return `Error: No character named "${args.name}" in scenario.`
      dispatchScenario({
        type: 'UPDATE_CHARACTER_XP',
        characterId: char.id,
        delta: args.delta as number,
      })
      const updated = getScenarioState()!.characters.find((c) => c.id === char.id)!
      return `${char.name} XP: ${updated.xp}`
    }

    default:
      return `Error: Unknown tool "${name}".`
  }
}

// --- Helpers ---

function parseEntityName(name: string): { groupName: string; standeeNumber: number } | null {
  const match = name.match(/^(.+)\s*#(\d+)$/)
  if (!match) return null
  return { groupName: match[1].trim(), standeeNumber: parseInt(match[2], 10) }
}

function applyHpChange(name: string, delta: number): string {
  const s = getScenarioState()
  if (!s) return 'Error: No scenario in progress.'

  // Try character first
  const char = s.characters.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  )
  if (char) {
    dispatchScenario({
      type: 'UPDATE_CHARACTER_HP',
      characterId: char.id,
      delta,
    })
    const updated = getScenarioState()!.characters.find((c) => c.id === char.id)!
    const verb = delta > 0 ? 'Healed' : 'Damaged'
    return `${verb} ${char.name} for ${Math.abs(delta)}. HP: ${updated.currentHp}/${updated.maxHp}`
  }

  // Try monster standee (Group Name #N)
  const parsed = parseEntityName(name)
  if (parsed) {
    const group = s.monsterGroups.find(
      (g) => g.name.toLowerCase() === parsed.groupName.toLowerCase(),
    )
    if (group) {
      const standee = group.standees.find(
        (st) => st.standeeNumber === parsed.standeeNumber && st.alive,
      )
      if (standee) {
        dispatchScenario({
          type: 'UPDATE_STANDEE_HP',
          groupId: group.id,
          standeeId: standee.id,
          delta,
        })
        const updatedGroup = getScenarioState()!.monsterGroups.find((g) => g.id === group.id)!
        const updatedStandee = updatedGroup.standees.find((st) => st.id === standee.id)!
        const maxHp = standee.rank === 'elite' ? group.maxHpElite : group.maxHpNormal
        const verb = delta > 0 ? 'Healed' : 'Damaged'
        return `${verb} ${group.name} #${standee.standeeNumber} for ${Math.abs(delta)}. HP: ${updatedStandee.currentHp}/${maxHp}`
      }
      return `Error: No alive standee #${parsed.standeeNumber} in "${group.name}".`
    }
  }

  return `Error: No character or monster named "${name}" found.`
}

function applyConditionToggle(name: string, condition: Condition): string {
  const s = getScenarioState()
  if (!s) return 'Error: No scenario in progress.'

  // Try character first
  const char = s.characters.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  )
  if (char) {
    dispatchScenario({
      type: 'TOGGLE_CHARACTER_CONDITION',
      characterId: char.id,
      condition,
    })
    const updated = getScenarioState()!.characters.find((c) => c.id === char.id)!
    const has = updated.conditions.includes(condition)
    return `${char.name} ${has ? 'now has' : 'no longer has'} ${condition}.`
  }

  // Try monster standee
  const parsed = parseEntityName(name)
  if (parsed) {
    const group = s.monsterGroups.find(
      (g) => g.name.toLowerCase() === parsed.groupName.toLowerCase(),
    )
    if (group) {
      const standee = group.standees.find(
        (st) => st.standeeNumber === parsed.standeeNumber && st.alive,
      )
      if (standee) {
        dispatchScenario({
          type: 'TOGGLE_STANDEE_CONDITION',
          groupId: group.id,
          standeeId: standee.id,
          condition,
        })
        const updatedGroup = getScenarioState()!.monsterGroups.find((g) => g.id === group.id)!
        const updatedStandee = updatedGroup.standees.find((st) => st.id === standee.id)!
        const has = updatedStandee.conditions.includes(condition)
        return `${group.name} #${standee.standeeNumber} ${has ? 'now has' : 'no longer has'} ${condition}.`
      }
      return `Error: No alive standee #${parsed.standeeNumber} in "${group.name}".`
    }
  }

  return `Error: No character or monster named "${name}" found.`
}
