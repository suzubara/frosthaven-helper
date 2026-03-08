import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Campaign } from '@/types/campaign'
import {
  initialState,
  campaignReducer,
  type CampaignAction,
} from '@/features/campaign/campaignReducer'
import { deleteCampaign, loadCampaign, saveCampaign } from '@/api/campaigns'

interface CampaignContextValue {
  campaign: Campaign | null
  dispatch: React.Dispatch<CampaignAction>
  isLoading: boolean
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({
  campaignId,
  children,
}: {
  campaignId: string
  children: ReactNode
}) {
  const [campaign, dispatch] = useReducer(campaignReducer, initialState)
  const [isLoading, setIsLoading] = useState(true)
  const prevCampaignIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const loaded = await loadCampaign(campaignId)
        if (cancelled) return

        if (loaded) {
          dispatch({ type: 'LOAD_CAMPAIGN', campaign: loaded })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [campaignId])

  useEffect(() => {
    if (isLoading) return

    const prevId = prevCampaignIdRef.current
    prevCampaignIdRef.current = campaign?.id ?? null

    if (campaign === null) {
      if (prevId) {
        void deleteCampaign(prevId)
      }
      return
    }

    void saveCampaign({ ...campaign, updatedAt: Date.now() })
  }, [campaign, isLoading])

  return (
    <CampaignContext value={{ campaign, dispatch, isLoading }}>
      {children}
    </CampaignContext>
  )
}

export function useCampaign(): CampaignContextValue {
  const context = useContext(CampaignContext)
  if (context === null) {
    throw new Error('useCampaign must be used within a CampaignProvider')
  }
  return context
}
