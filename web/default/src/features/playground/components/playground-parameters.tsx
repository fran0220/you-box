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
import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { SessionStats } from '@/components/ai-elements/session-stats'
import { Eyebrow, MonoInput, ParameterSlider } from '@/components/patterns'
import { SettingRow } from '@/components/settings'
import type { Message, ParameterEnabled, PlaygroundConfig } from '../types'

type SliderParameterKey =
  | 'temperature'
  | 'top_p'
  | 'max_tokens'
  | 'frequency_penalty'
  | 'presence_penalty'

interface PlaygroundParametersProps {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  onConfigChange: <K extends keyof PlaygroundConfig>(
    key: K,
    value: PlaygroundConfig[K]
  ) => void
  onParameterEnabledChange: (
    key: keyof ParameterEnabled,
    value: boolean
  ) => void
  messages: Message[]
  className?: string
}

/**
 * PlaygroundParameters (R2-B4) — the right-rail parameter panel:
 * `// parameters` Eyebrow + ParameterSlider rows (each with an enable
 * Switch wired to ParameterEnabled), seed input, Stream response toggle
 * and the `// this session` SessionStats block. Rendered both in the
 * desktop rail and inside the mobile Sheet.
 */
export function PlaygroundParameters({
  config,
  parameterEnabled,
  onConfigChange,
  onParameterEnabledChange,
  messages,
  className,
}: PlaygroundParametersProps) {
  const { t } = useTranslation()
  const seedId = useId()
  const streamId = useId()

  const sliderParameters: Array<{
    key: SliderParameterKey
    label: string
    min: number
    max: number
    step: number
    formatValue?: (value: number) => string
  }> = [
    { key: 'temperature', label: t('Temperature'), min: 0, max: 2, step: 0.1 },
    { key: 'top_p', label: t('Top P'), min: 0, max: 1, step: 0.05 },
    {
      key: 'max_tokens',
      label: t('Max tokens'),
      min: 1,
      max: 128000,
      step: 1,
      formatValue: (value) => value.toLocaleString(),
    },
    {
      key: 'frequency_penalty',
      label: t('Frequency penalty'),
      min: -2,
      max: 2,
      step: 0.1,
    },
    {
      key: 'presence_penalty',
      label: t('Presence penalty'),
      min: -2,
      max: 2,
      step: 0.1,
    },
  ]

  // Session stats from real response data only — no fabricated values.
  // Tokens: usage is only reported on non-streaming responses today (the
  // streaming path does not request `stream_options.include_usage`).
  // Cost: per-request cost is not exposed by the backend yet → always '—'
  // until usage/pricing passthrough lands.
  // Latency: measured wall-clock duration of each completed request.
  const sessionStats = useMemo(() => {
    let totalTokens = 0
    let hasUsage = false
    let lastLatencyMs: number | undefined
    for (const message of messages) {
      if (message.usage) {
        hasUsage = true
        totalTokens += message.usage.total_tokens
      }
      if (message.latencyMs != null) {
        lastLatencyMs = message.latencyMs
      }
    }
    return {
      tokens: hasUsage ? totalTokens.toLocaleString() : '—',
      cost: '—',
      latency:
        lastLatencyMs != null ? `${(lastLatencyMs / 1000).toFixed(2)}s` : '—',
    }
  }, [messages])

  return (
    <div
      data-slot='playground-parameters'
      className={cn('flex flex-col gap-5 p-4 sm:p-5', className)}
    >
      <Eyebrow>{t('Parameters')}</Eyebrow>

      <div className='flex flex-col gap-5'>
        {sliderParameters.map(({ key, label, min, max, step, formatValue }) => (
          <div key={key} className='flex items-start gap-3'>
            <ParameterSlider
              className='min-w-0 flex-1'
              label={label}
              value={config[key]}
              onValueChange={(value) => onConfigChange(key, value)}
              min={min}
              max={max}
              step={step}
              formatValue={formatValue}
              disabled={!parameterEnabled[key]}
            />
            <Switch
              size='sm'
              className='mt-0.5'
              checked={parameterEnabled[key]}
              onCheckedChange={(checked) =>
                onParameterEnabledChange(key, checked)
              }
              aria-label={t('Enable {{parameter}}', { parameter: label })}
            />
          </div>
        ))}

        {/* Seed — numeric input + enable switch */}
        <div className='flex items-start gap-3'>
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <label
              htmlFor={seedId}
              className={cn(
                'text-muted-foreground text-[13px]',
                !parameterEnabled.seed && 'opacity-50'
              )}
            >
              {t('Seed')}
            </label>
            <MonoInput
              id={seedId}
              type='number'
              inputMode='numeric'
              placeholder={t('Random')}
              disabled={!parameterEnabled.seed}
              value={config.seed ?? ''}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10)
                onConfigChange('seed', Number.isNaN(parsed) ? null : parsed)
              }}
            />
          </div>
          <Switch
            size='sm'
            className='mt-0.5'
            checked={parameterEnabled.seed}
            onCheckedChange={(checked) =>
              onParameterEnabledChange('seed', checked)
            }
            aria-label={t('Enable {{parameter}}', { parameter: t('Seed') })}
          />
        </div>
      </div>

      <Separator />

      <SettingRow
        className='border-b-0 py-0'
        label={t('Stream response')}
        description={t('Render tokens as they are generated')}
        htmlFor={streamId}
        control={
          <Switch
            id={streamId}
            checked={config.stream}
            onCheckedChange={(checked) => onConfigChange('stream', checked)}
          />
        }
      />

      <Separator />

      <Eyebrow>{t('This session')}</Eyebrow>
      <SessionStats
        items={[
          { label: t('Tokens'), value: sessionStats.tokens },
          { label: t('Cost'), value: sessionStats.cost },
          { label: t('Latency'), value: sessionStats.latency },
        ]}
      />
    </div>
  )
}
