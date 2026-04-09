import type { Campaign } from '@/types/campaign'
import type { ScenarioSession } from '@/types/scenario'
import { campaignReducer, type CampaignAction } from '@/features/campaign/campaignReducer'
import { scenarioReducer, type ScenarioAction } from '@/features/scenario/scenarioReducer'
import { saveCampaign, loadCampaign, listCampaigns } from '@/storage/campaigns'
import { saveSession } from '@/storage/scenarios'

let campaignState: Campaign | null = null
let scenarioState: ScenarioSession | null = null
const listeners = new Set<() => void>()
let cachedSnapshot = { campaign: campaignState, scenario: scenarioState }

function notify() {
  cachedSnapshot = { campaign: campaignState, scenario: scenarioState }
  listeners.forEach((fn) => fn())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): { campaign: Campaign | null; scenario: ScenarioSession | null } {
  return cachedSnapshot
}

export function getCampaignState(): Campaign | null {
  return campaignState
}

export function getScenarioState(): ScenarioSession | null {
  return scenarioState
}

export function dispatchCampaign(action: CampaignAction): void {
  campaignState = campaignReducer(campaignState, action)
  if (campaignState) {
    campaignState = { ...campaignState, updatedAt: Date.now() }
    saveCampaign(campaignState)
  }
  notify()
}

export function dispatchScenario(action: ScenarioAction): void {
  scenarioState = scenarioReducer(scenarioState, action)
  if (scenarioState) {
    scenarioState = { ...scenarioState, updatedAt: Date.now() }
    saveSession(scenarioState)
  }
  notify()
}

export function loadCampaignById(id: string): Campaign | undefined {
  const campaign = loadCampaign(id)
  if (campaign) {
    dispatchCampaign({ type: 'LOAD_CAMPAIGN', campaign })
  }
  return campaign
}

export function loadCampaignByName(name: string): Campaign | undefined {
  const campaigns = listCampaigns()
  const match = campaigns.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  )
  if (match) {
    dispatchCampaign({ type: 'LOAD_CAMPAIGN', campaign: match })
  }
  return match
}
