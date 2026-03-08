import { useSearchParams } from 'react-router'
import { ScenarioProvider, useScenario } from '@/features/scenario/ScenarioContext'
import { ScenarioSetup } from '@/features/scenario/ScenarioSetup'
import { ScenarioTracker } from '@/features/scenario/ScenarioTracker'
import { loadCampaign } from '@/storage/campaigns'
import type { PartyCharacter } from '@/types/campaign'

function ScenarioContent({
  preloadedCharacters,
}: {
  preloadedCharacters?: PartyCharacter[]
}) {
  const { session, dispatch } = useScenario()

  if (!session) {
    return (
      <ScenarioSetup
        preloadedCharacters={preloadedCharacters}
        onStart={(s) => dispatch({ type: 'LOAD_SESSION', session: s })}
      />
    )
  }

  return <ScenarioTracker />
}

export default function ScenarioPage() {
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  let preloadedCharacters: PartyCharacter[] | undefined
  if (campaignId) {
    const campaign = loadCampaign(campaignId)
    if (campaign) {
      preloadedCharacters = campaign.party.filter((c) => !c.retired)
    }
  }

  return (
    <ScenarioProvider>
      <ScenarioContent preloadedCharacters={preloadedCharacters} />
    </ScenarioProvider>
  )
}
