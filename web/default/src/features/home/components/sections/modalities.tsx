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
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useProduct } from '@/products'

const MODALITY_GROUPS: Array<{
  label: string
  vendors: Array<{ name: string; icon: string }>
}> = [
  {
    label: 'Image',
    vendors: [
      { name: 'Midjourney', icon: 'Midjourney' },
      { name: 'FLUX', icon: 'Flux' },
      { name: 'Stability AI', icon: 'Stability.Color' },
      { name: 'Ideogram', icon: 'Ideogram' },
      { name: 'Recraft', icon: 'Recraft' },
      { name: 'Krea', icon: 'Krea' },
      { name: 'Jimeng', icon: 'Jimeng.Color' },
    ],
  },
  {
    label: 'Video',
    vendors: [
      { name: 'Kling', icon: 'Kling.Color' },
      { name: 'Vidu', icon: 'Vidu.Color' },
      { name: 'Runway', icon: 'Runway' },
      { name: 'Luma', icon: 'Luma.Color' },
      { name: 'Pika', icon: 'Pika' },
      { name: 'Hailuo', icon: 'Hailuo.Color' },
    ],
  },
  {
    label: 'Audio',
    vendors: [
      { name: 'Suno', icon: 'Suno' },
      { name: 'Udio', icon: 'Udio.Color' },
      { name: 'ElevenLabs', icon: 'ElevenLabs' },
      { name: 'Fish Audio', icon: 'FishAudio' },
    ],
  },
  {
    label: '3D',
    vendors: [
      { name: 'Tripo', icon: 'Tripo.Color' },
      { name: 'Meshy', icon: 'Meshy.Color' },
    ],
  },
]

/**
 * Generative-media wall. Circuit: card rows with brand label chips.
 * Paper: hairline rows.
 */
export function Modalities() {
  const { t } = useTranslation()
  const product = useProduct()
  const isCircuit = product.ui.skin === 'circuit'

  return (
    <section
      data-slot={isCircuit ? 'home-section' : undefined}
      className={cn(!isCircuit && 'border-border/70 border-t py-14 md:py-20')}
    >
      <div
        className={cn(
          isCircuit
            ? 'home-section-inner'
            : 'mx-auto w-full max-w-6xl px-4 md:px-6'
        )}
      >
        <p className='yb-eyebrow mb-4'>{t('Beyond text')}</p>
        <h2
          className={cn(
            'font-display max-w-[16em] text-3xl leading-[1.1] md:text-4xl',
            isCircuit ? 'font-semibold tracking-[-0.03em]' : 'font-normal'
          )}
        >
          {t('Image, video, audio, and 3D')}
        </h2>
        <p className='text-muted-foreground mt-4 max-w-[36em] text-base leading-relaxed'>
          {t(
            'The same key and balance also drive generative media models, with no separate account per vendor.'
          )}
        </p>

        {isCircuit ? (
          <div className='mt-10 grid gap-3'>
            {MODALITY_GROUPS.map((group) => (
              <div
                key={group.label}
                className='border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:gap-6 sm:px-5'
              >
                <h3 className='text-brand shrink-0 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase sm:w-20'>
                  {t(group.label)}
                </h3>
                <ul className='flex flex-wrap gap-2'>
                  {group.vendors.map((vendor) => (
                    <li key={vendor.name} data-slot='circuit-tile'>
                      <span className='shrink-0' aria-hidden='true'>
                        {getLobeIcon(vendor.icon, 16)}
                      </span>
                      {vendor.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className='border-border/70 mt-10 border-t'>
            {MODALITY_GROUPS.map((group) => (
              <div
                key={group.label}
                className='border-border/70 flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-baseline sm:gap-6'
              >
                <h3 className='text-muted-foreground w-24 shrink-0 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase'>
                  {t(group.label)}
                </h3>
                <ul className='flex flex-wrap gap-x-7 gap-y-3'>
                  {group.vendors.map((vendor) => (
                    <li
                      key={vendor.name}
                      className='text-muted-foreground hover:text-foreground flex items-center gap-2 text-[13px] font-medium transition-colors'
                    >
                      <span className='shrink-0' aria-hidden='true'>
                        {getLobeIcon(vendor.icon, 18)}
                      </span>
                      {vendor.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
