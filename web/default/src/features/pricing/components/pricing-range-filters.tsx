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
import { useTranslation } from 'react-i18next'
import { Slider } from '@/components/ui/slider'
import {
  CONTEXT_LENGTH_MIN,
  CONTEXT_LENGTH_STOPS,
  PROMPT_PRICE_STEP,
} from '../constants'
import { formatTokenCount } from '../lib/model-metadata'

// ----------------------------------------------------------------------------
// Context-length slider — operates on the discrete CONTEXT_LENGTH_STOPS indices
// so the thumb snaps to human-friendly K/M ticks. Index 0 == "any" (no lower
// bound); we only filter on a minimum (>= selected stop).
// ----------------------------------------------------------------------------

export interface ContextLengthSliderProps {
  /** Current [min, max] in tokens. [0,0] == unbounded. */
  value: [number, number]
  onChange: (value: [number, number]) => void
}

function tokensToStopIndex(tokens: number): number {
  if (tokens <= CONTEXT_LENGTH_MIN) return 0
  // Largest stop <= tokens (so an arbitrary URL value still maps to a tick).
  let idx = 0
  for (let i = 0; i < CONTEXT_LENGTH_STOPS.length; i++) {
    if (CONTEXT_LENGTH_STOPS[i] <= tokens) idx = i
  }
  return idx
}

export function ContextLengthSlider(props: ContextLengthSliderProps) {
  const { t } = useTranslation()
  const lastIndex = CONTEXT_LENGTH_STOPS.length - 1
  const minIndex = tokensToStopIndex(props.value[0])

  const handleChange = (next: number | readonly number[]) => {
    const idx = Array.isArray(next) ? next[0] : (next as number)
    const tokens = CONTEXT_LENGTH_STOPS[idx] ?? CONTEXT_LENGTH_MIN
    // Lower-bound only: keep existing upper bound untouched (we never set one).
    props.onChange([tokens, props.value[1]])
  }

  return (
    <div className='space-y-2 px-1'>
      <Slider
        value={[minIndex]}
        min={0}
        max={lastIndex}
        step={1}
        onValueChange={handleChange}
        aria-label={t('Minimum context length')}
      />
      <div className='text-muted-foreground flex items-center justify-between text-xs'>
        <span>{t('Any')}</span>
        <span className='text-foreground font-medium tabular-nums'>
          {minIndex === 0
            ? t('Any length')
            : t('{{tokens}}+ tokens', {
                tokens: formatTokenCount(CONTEXT_LENGTH_STOPS[minIndex]),
              })}
        </span>
        <span>{formatTokenCount(CONTEXT_LENGTH_STOPS[lastIndex])}</span>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Prompt-price slider — FREE (0) → ceiling (USD per 1M input tokens). We filter
// on an upper bound only; max == ceiling means "no upper bound".
// ----------------------------------------------------------------------------

export interface PromptPriceSliderProps {
  /** Current [min, max] in USD/M. [0,-1] == unbounded. */
  value: [number, number]
  /** Catalog ceiling (USD/M) computed from the live data. */
  ceiling: number
  onChange: (value: [number, number]) => void
}

export function PromptPriceSlider(props: PromptPriceSliderProps) {
  const { t } = useTranslation()
  const ceiling = Math.max(props.ceiling, PROMPT_PRICE_STEP)
  // max < 0 (unset) maps to the ceiling thumb position.
  const currentMax = props.value[1] < 0 ? ceiling : props.value[1]

  const handleChange = (next: number | readonly number[]) => {
    const max = Array.isArray(next) ? next[0] : (next as number)
    // At the ceiling we treat it as "no upper bound" (-1 sentinel).
    props.onChange([0, max >= ceiling ? -1 : max])
  }

  return (
    <div className='space-y-2 px-1'>
      <Slider
        value={[currentMax]}
        min={0}
        max={ceiling}
        step={PROMPT_PRICE_STEP}
        onValueChange={handleChange}
        aria-label={t('Maximum prompt price')}
      />
      <div className='text-muted-foreground flex items-center justify-between text-xs'>
        <span>{t('FREE')}</span>
        <span className='text-foreground font-medium tabular-nums'>
          {props.value[1] < 0
            ? t('Any price')
            : t('Up to ${{price}}/1M', { price: currentMax.toFixed(2) })}
        </span>
        <span className='tabular-nums'>${ceiling.toFixed(0)}</span>
      </div>
    </div>
  )
}
