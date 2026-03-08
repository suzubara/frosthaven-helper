import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { loadCampaign, saveCampaign } from '@/api/campaigns'

interface CampaignContextValue {
  campaign: Campaign | null
  dispatch: React.Dispatch<CampaignAction>
  reloadCampaign: () => Promise<void>
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
  const savedCampaignRef = useRef<Campaign | null>(null)

  const reloadCampaign = useCallback(async () => {
    const loaded = await loadCampaign(campaignId)
    if (loaded) {
      savedCampaignRef.current = loaded
      dispatch({ type: 'LOAD_CAMPAIGN', campaign: loaded })
    }
  }, [campaignId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await reloadCampaign()
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
  }, [reloadCampaign])

  useEffect(() => {
    if (campaign === null) return
    if (campaign === savedCampaignRef.current) return

    savedCampaignRef.current = campaign
    void saveCampaign({ ...campaign, updatedAt: Date.now() })
  }, [campaign])

  const value = useMemo(
    () => ({ campaign, dispatch, reloadCampaign }),
    [campaign, dispatch, reloadCampaign],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading campaign…</p>
      </div>
    )
  }

  return (
    <CampaignContext value={value}>
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
