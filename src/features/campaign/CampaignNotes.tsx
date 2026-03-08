import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface CampaignNotesProps {
  stickers: string[]
  notes: string
  onAddSticker: (sticker: string) => void
  onRemoveSticker: (sticker: string) => void
  onUpdateNotes: (notes: string) => void
}

export function CampaignNotes({
  stickers,
  notes,
  onAddSticker,
  onRemoveSticker,
  onUpdateNotes,
}: CampaignNotesProps) {
  const [stickerInput, setStickerInput] = useState('')

  function handleAddSticker(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = stickerInput.trim()
    if (!trimmed) return
    onAddSticker(trimmed)
    setStickerInput('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes & Stickers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {stickers.map((sticker) => (
              <Badge key={sticker}>
                {sticker}
                <button
                  type="button"
                  className="ml-1 hover:text-destructive"
                  onClick={() => onRemoveSticker(sticker)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <form onSubmit={handleAddSticker} className="flex gap-2">
            <Input
              value={stickerInput}
              onChange={(e) => setStickerInput(e.target.value)}
              placeholder="New sticker…"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!stickerInput.trim()}
            >
              Add
            </Button>
          </form>
        </div>

        <textarea
          className="border border-input bg-transparent rounded-md px-3 py-2 text-sm min-h-[120px] w-full"
          value={notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Campaign notes…"
        />
      </CardContent>
    </Card>
  )
}
