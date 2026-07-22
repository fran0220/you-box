import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookmarkPlus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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

interface PresetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Current config, serialized when saving a new preset. */
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  /** Apply a loaded preset to the live playground state. */
  onApply: (
    config: Partial<PlaygroundConfig>,
    enabled?: ParameterEnabled
  ) => void
}

/**
 * PresetsDialog — save the current model/parameters/system prompt as a
 * named preset and re-apply saved presets. Hosted from the chat overflow
 * menu (no top-level chrome of its own).
 */
export function PresetsDialog(props: PresetsDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')

  const { data: presets = [] } = useQuery({
    queryKey: ['playground-presets'],
    queryFn: getPresets,
    staleTime: 30 * 1000,
    enabled: props.open,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['playground-presets'] })

  const saveMutation = useMutation({
    mutationFn: (presetName: string) => {
      const payload: PresetPayload = {
        config: props.config,
        parameterEnabled: props.parameterEnabled,
      }
      return createPreset(presetName, JSON.stringify(payload))
    },
    onSuccess: () => {
      toast.success(t('Preset saved'))
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
      props.onApply(payload.config, payload.parameterEnabled)
      toast.success(t('Preset “{{name}}” applied', { name: preset.name }))
      props.onOpenChange(false)
    } catch {
      toast.error(t('This preset could not be loaded'))
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('Presets')}</DialogTitle>
          <DialogDescription>
            {t(
              'Save the current model, parameters, and system prompt as a reusable preset.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2'>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('Preset name')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && name.trim()) {
                saveMutation.mutate(name.trim())
              }
            }}
          />
          <Button
            onClick={() => saveMutation.mutate(name.trim())}
            disabled={!name.trim() || saveMutation.isPending}
            className='shrink-0'
          >
            <BookmarkPlus className='size-4' />
            {t('Save')}
          </Button>
        </div>

        {presets.length > 0 && (
          <>
            <Separator />
            <div className='max-h-64 space-y-0.5 overflow-y-auto'>
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className='group hover:bg-surface-hover flex items-center gap-2 rounded-md px-2 py-1.5'
                >
                  <button
                    type='button'
                    onClick={() => applyPreset(preset)}
                    className='text-foreground min-w-0 flex-1 truncate text-start text-sm'
                    title={t('Apply preset')}
                  >
                    {preset.name}
                  </button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    aria-label={t('Delete preset')}
                    className='text-muted-foreground hover:text-destructive size-6 opacity-0 group-hover:opacity-100'
                    onClick={() => deleteMutation.mutate(preset.id)}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
