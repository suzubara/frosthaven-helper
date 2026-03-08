import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { Campaign } from '@/types/campaign'
import {
  initialState,
  campaignReducer,
  type CampaignAction,
} from '@/features/campaign/campaignReducer'
import {
  loadCampaign as loadCampaignFromStorage,
  saveCampaign,
} from '@/storage/campaigns'

interface CampaignContextValue {
  campaign: Campaign | null
  dispatch: React.Dispatch<CampaignAction>
  reloadCampaign: () => void
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({
  campaignId,
  children,
}: {
  campaignId: string
  children: ReactNode
}) {
  const [campaign, dispatch] = useReducer(campaignReducer, undefined, () => {
    const loaded = loadCampaignFromStorage(campaignId)
    return loaded ?? initialState
  })
  const savedCampaignRef = useRef<Campaign | null>(campaign)

  const reloadCampaign = useCallback(() => {
    const loaded = loadCampaignFromStorage(campaignId)
    if (loaded) {
      savedCampaignRef.current = loaded
      dispatch({ type: 'LOAD_CAMPAIGN', campaign: loaded })
    }
  }, [campaignId])

  useEffect(() => {
    if (campaign === null) return
    if (campaign === savedCampaignRef.current) return

    savedCampaignRef.current = campaign
    saveCampaign({ ...campaign, updatedAt: Date.now() })
  }, [campaign])

  const value = useMemo(
    () => ({ campaign, dispatch, reloadCampaign }),
    [campaign, dispatch, reloadCampaign],
  )

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
