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
import { PROMPT_PRICE_STEP } from '../constants'

export interface PromptPriceSliderProps {
  value: [number, number]
  ceiling: number
  onChange: (value: [number, number]) => void
}

export function PromptPriceSlider(props: PromptPriceSliderProps) {
  const { t } = useTranslation()
  const ceiling = Math.max(props.ceiling, PROMPT_PRICE_STEP)
  const currentMax = props.value[1] < 0 ? ceiling : props.value[1]

  const handleChange = (next: number | readonly number[]) => {
    const max = Array.isArray(next) ? next[0] : (next as number)
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
