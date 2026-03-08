import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CharacterState, MonsterGroup } from '@/types/scenario'

interface InitiativeInputProps {
  characters: CharacterState[]
  monsterGroups: MonsterGroup[]
  onSetCharacterInitiative: (characterId: string, initiative: number) => void
  onSetCharacterLongRest: (characterId: string) => void
  onClearCharacterInitiative: (characterId: string) => void
  onSetMonsterInitiative: (groupId: string, initiative: number) => void
  onClearMonsterInitiative: (groupId: string) => void
}

export function InitiativeInput({
  characters,
  monsterGroups,
  onSetCharacterInitiative,
  onSetCharacterLongRest,
  onClearCharacterInitiative,
  onSetMonsterInitiative,
  onClearMonsterInitiative,
}: InitiativeInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Initiative</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {characters.map((char) => (
          <div key={char.id} className="flex items-center gap-3">
            <Label className="w-32 shrink-0 truncate">{char.name}</Label>
            {char.longRest ? (
              <>
                <span className="text-sm font-medium tabular-nums">99 💤</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClearCharacterInitiative(char.id)}
                >
                  Cancel Rest
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="--"
                  className="w-20"
                  value={char.initiative ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (!isNaN(val) && val >= 1 && val <= 99) {
                      onSetCharacterInitiative(char.id, val)
                    } else if (e.target.value === '') {
                      onClearCharacterInitiative(char.id)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetCharacterLongRest(char.id)}
                >
                  Long Rest
                </Button>
              </>
            )}
          </div>
        ))}

        {monsterGroups.map((group) => (
          <div key={group.id} className="flex items-center gap-3">
            <Label className="w-32 shrink-0 truncate">{group.name}</Label>
            <Input
              type="number"
              min={1}
              max={99}
              placeholder="--"
              className="w-20"
              value={group.initiative ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val) && val >= 1 && val <= 99) {
                  onSetMonsterInitiative(group.id, val)
                } else if (e.target.value === '') {
                  onClearMonsterInitiative(group.id)
                }
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
