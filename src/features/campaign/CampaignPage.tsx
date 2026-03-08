import { useParams } from 'react-router'
import { CampaignProvider, useCampaign } from '@/features/campaign/CampaignContext'
import { ResourceTracker } from '@/features/campaign/ResourceTracker'
import { OutpostStats } from '@/features/campaign/OutpostStats'
import { CampaignCalendar } from '@/features/campaign/CampaignCalendar'
import { BuildingList } from '@/features/campaign/BuildingList'
import { PartyRoster } from '@/features/campaign/PartyRoster'
import { CampaignNotes } from '@/features/campaign/CampaignNotes'

function CampaignContent() {
  const { campaign, dispatch, isLoading } = useCampaign()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading campaign…</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Campaign not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">{campaign.name}</h1>

      <CampaignCalendar
        calendar={campaign.calendar}
        onMarkWeek={() => dispatch({ type: 'MARK_WEEK' })}
        onUnmarkWeek={() => dispatch({ type: 'UNMARK_WEEK' })}
        onAddSection={(weekIndex, section) =>
          dispatch({ type: 'ADD_CALENDAR_SECTION', weekIndex, section })
        }
        onRemoveSection={(weekIndex, section) =>
          dispatch({ type: 'REMOVE_CALENDAR_SECTION', weekIndex, section })
        }
      />

      <ResourceTracker
        resources={campaign.resources}
        onUpdate={(resource, delta) =>
          dispatch({ type: 'UPDATE_RESOURCE', resource, delta })
        }
      />

      <OutpostStats
        morale={campaign.morale}
        prosperityCheckmarks={campaign.prosperityCheckmarks}
        totalDefense={campaign.totalDefense}
        soldiers={campaign.soldiers}
        barracksMaxSoldiers={campaign.barracksMaxSoldiers}
        inspiration={campaign.inspiration}
        onUpdateMorale={(delta) => dispatch({ type: 'UPDATE_MORALE', delta })}
        onUpdateProsperity={(delta) =>
          dispatch({ type: 'UPDATE_PROSPERITY', delta })
        }
        onUpdateDefense={(delta) =>
          dispatch({ type: 'UPDATE_DEFENSE', delta })
        }
        onUpdateSoldiers={(delta) =>
          dispatch({ type: 'UPDATE_SOLDIERS', delta })
        }
        onUpdateInspiration={(delta) =>
          dispatch({ type: 'UPDATE_INSPIRATION', delta })
        }
      />

      <BuildingList
        buildings={campaign.buildings}
        onAdd={(building) => dispatch({ type: 'ADD_BUILDING', building })}
        onRemove={(buildingId) =>
          dispatch({ type: 'REMOVE_BUILDING', buildingId })
        }
        onUpgrade={(buildingId) =>
          dispatch({ type: 'UPGRADE_BUILDING', buildingId })
        }
        onWreck={(buildingId) =>
          dispatch({ type: 'WRECK_BUILDING', buildingId })
        }
        onRebuild={(buildingId) =>
          dispatch({ type: 'REBUILD_BUILDING', buildingId })
        }
      />

      <PartyRoster
        party={campaign.party}
        onAdd={(character) => dispatch({ type: 'ADD_CHARACTER', character })}
        onRemove={(characterId) =>
          dispatch({ type: 'REMOVE_CHARACTER', characterId })
        }
        onUpdate={(characterId, updates) =>
          dispatch({ type: 'UPDATE_CHARACTER', characterId, updates })
        }
        onRetire={(characterId) =>
          dispatch({ type: 'RETIRE_CHARACTER', characterId })
        }
      />

      <CampaignNotes
        stickers={campaign.campaignStickers}
        notes={campaign.notes}
        onAddSticker={(sticker) => dispatch({ type: 'ADD_STICKER', sticker })}
        onRemoveSticker={(sticker) =>
          dispatch({ type: 'REMOVE_STICKER', sticker })
        }
        onUpdateNotes={(notes) => dispatch({ type: 'UPDATE_NOTES', notes })}
      />
    </div>
  )
}

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return (
    <CampaignProvider campaignId={id}>
      <CampaignContent />
    </CampaignProvider>
  )
}
