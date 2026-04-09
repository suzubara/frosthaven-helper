import type { Campaign } from '@/types/campaign'
import type { ScenarioSession } from '@/types/scenario'
import { campaignReducer, type CampaignAction } from '@/features/campaign/campaignReducer'
import { scenarioReducer, type ScenarioAction } from '@/features/scenario/scenarioReducer'
import { saveCampaign, loadCampaign, listCampaigns } from '@/storage/campaigns'
import { saveSession } from '@/storage/scenarios'

let campaignState: Campaign | null = null
let scenarioState: ScenarioSession | null = null

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
}

export function dispatchScenario(action: ScenarioAction): void {
  scenarioState = scenarioReducer(scenarioState, action)
  if (scenarioState) {
    scenarioState = { ...scenarioState, updatedAt: Date.now() }
    saveSession(scenarioState)
  }
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
