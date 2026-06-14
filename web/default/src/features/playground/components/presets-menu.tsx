/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookmarkPlus, Check, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  createPreset,
  deletePreset,
  getPresets,
  type PlaygroundPreset,
} from '../api'
import type { ParameterEnabled, PlaygroundConfig } from '../types'

interface PresetPayload {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
}

interface PresetsMenuProps {
  /** Current config, serialized when saving a new preset. */
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  /** Apply a loaded preset to the live playground state. */
  onApply: (config: Partial<PlaygroundConfig>, enabled?: ParameterEnabled) => void
  disabled?: boolean
}

export function PresetsMenu({
  config,
  parameterEnabled,
  onApply,
  disabled,
}: PresetsMenuProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [saveOpen, setSaveOpen] = useState(false)
  const [name, setName] = useState('')

  const { data: presets = [] } = useQuery({
    queryKey: ['playground-presets'],
    queryFn: getPresets,
    staleTime: 30 * 1000,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['playground-presets'] })

  const saveMutation = useMutation({
    mutationFn: (presetName: string) => {
      const payload: PresetPayload = { config, parameterEnabled }
      return createPreset(presetName, JSON.stringify(payload))
    },
    onSuccess: () => {
      toast.success(t('Preset saved'))
      setSaveOpen(false)
      setName('')
      void invalidate()
    },
    onError: () => toast.error(t('Failed to save preset')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePreset(id),
    onSuccess: () => void invalidate(),
    onError: () => toast.error(t('Failed to delete preset')),
  })

  const applyPreset = (preset: PlaygroundPreset) => {
    try {
      const payload = JSON.parse(preset.config) as PresetPayload
      if (!payload?.config) throw new Error('invalid preset')
      onApply(payload.config, payload.parameterEnabled)
      toast.success(t('Preset “{{name}}” applied', { name: preset.name }))
    } catch {
      toast.error(t('This preset could not be loaded'))
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              size='sm'
              disabled={disabled}
              className='gap-1.5'
            />
          }
        >
          <BookmarkPlus className='size-4' />
          <span className='hidden sm:inline'>{t('Presets')}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-60'>
          <DropdownMenuItem onClick={() => setSaveOpen(true)}>
            <BookmarkPlus className='mr-2 size-4' />
            {t('Save current as preset…')}
          </DropdownMenuItem>
          {presets.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('Saved presets')}</DropdownMenuLabel>
              {presets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  className='group justify-between gap-2'
                  onClick={() => applyPreset(preset)}
                >
                  <span className='flex min-w-0 items-center gap-2'>
                    <Check className='size-3.5 shrink-0 opacity-0' />
                    <span className='truncate'>{preset.name}</span>
                  </span>
                  <button
                    type='button'
                    aria-label={t('Delete preset')}
                    className='text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteMutation.mutate(preset.id)
                    }}
                  >
                    <Trash2 className='size-3.5' />
                  </button>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>{t('Save preset')}</DialogTitle>
            <DialogDescription>
              {t(
                'Save the current model, parameters, and system prompt as a reusable preset.'
              )}
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('Preset name')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && name.trim()) {
                saveMutation.mutate(name.trim())
              }
            }}
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setSaveOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button
              onClick={() => saveMutation.mutate(name.trim())}
              disabled={!name.trim() || saveMutation.isPending}
            >
              {t('Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
