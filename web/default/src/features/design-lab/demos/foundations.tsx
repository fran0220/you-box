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
import { DemoBlock, DemoRow } from '../components/demo-block'

const SURFACES = [
  ['bg-background', 'bg-background'],
  ['bg-surface', 'bg-surface'],
  ['bg-surface-2', 'bg-surface-2'],
  ['bg-surface-3', 'bg-surface-3'],
  ['bg-card', 'bg-card'],
  ['bg-brand-subtle', 'bg-brand-subtle'],
  ['bg-success-subtle', 'bg-success-subtle'],
] as const

const SEMANTIC = [
  ['brand', 'bg-brand'],
  ['accent', 'bg-accent'],
  ['success', 'bg-success'],
  ['warning', 'bg-warning'],
  ['destructive', 'bg-destructive'],
  ['info', 'bg-info'],
] as const

/**
 * Token sanity board: surfaces, semantic colors and the three type
 * families. Serves as the carrier proof for the gallery shell — Phase A
 * component demos land in their own groups.
 */
export default function FoundationsDemos() {
  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock title='Color tokens' description='surfaces + semantic'>
        <DemoRow label='surfaces'>
          {SURFACES.map(([name, cls]) => (
            <div key={name} className='flex flex-col items-center gap-1.5'>
              <div className={`size-12 rounded-md border ${cls}`} />
              <span className='text-muted-foreground font-mono text-[10px]'>
                {name}
              </span>
            </div>
          ))}
        </DemoRow>
        <DemoRow label='semantic'>
          {SEMANTIC.map(([name, cls]) => (
            <div key={name} className='flex flex-col items-center gap-1.5'>
              <div className={`size-12 rounded-md ${cls}`} />
              <span className='text-muted-foreground font-mono text-[10px]'>
                {name}
              </span>
            </div>
          ))}
        </DemoRow>
      </DemoBlock>

      <DemoBlock title='Typography' description='display / sans / mono'>
        <DemoRow label='display' className='flex-col gap-1'>
          <span className='font-display text-3xl font-bold tracking-[-0.025em]'>
            Every model, one box.
          </span>
          <span className='font-display text-xl font-semibold tracking-[-0.01em]'>
            Panel title — 22px
          </span>
        </DemoRow>
        <DemoRow label='sans' className='flex-col gap-1'>
          <span className='text-sm'>
            Body copy at 14px — routing, failover and pass-through pricing.
          </span>
          <span className='text-muted-foreground text-xs'>
            Muted helper text at 12px.
          </span>
        </DemoRow>
        <DemoRow label='mono' className='flex-col gap-1'>
          <span className='font-mono text-sm'>$248.10 · 1,284,002 · 0.46s</span>
          <span className='text-brand font-mono text-[10px] tracking-[0.1em] uppercase'>
            {'// eyebrow label'}
          </span>
        </DemoRow>
      </DemoBlock>
    </div>
  )
}
