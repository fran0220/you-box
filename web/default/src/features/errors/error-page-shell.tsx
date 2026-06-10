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
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorPageShellProps = {
  code: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  icon: LucideIcon
  actions?: React.ReactNode
  footnote?: React.ReactNode
  className?: string
}

/**
 * YouBox error page shell: centered brand-glow canvas, brand-subtle icon
 * tile, oversized display-font status code, semantic copy and actions.
 */
export function ErrorPageShell(props: ErrorPageShellProps) {
  const Icon = props.icon
  return (
    <div
      className={cn(
        'relative flex h-svh w-full items-center justify-center overflow-hidden px-6',
        props.className
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[10px]'
        style={{
          background:
            'radial-gradient(circle, rgba(0, 144, 255,0.12), transparent 62%)',
        }}
      />
      <div className='relative max-w-md text-center'>
        <div className='bg-brand-subtle text-brand mx-auto mb-7 flex size-16 items-center justify-center rounded-xl'>
          <Icon className='size-8' aria-hidden='true' />
        </div>
        <div className='font-display text-[6rem] leading-none font-bold tracking-[-0.04em]'>
          {props.code}
        </div>
        <h1 className='font-display mt-4 mb-2 text-2xl font-semibold tracking-[-0.02em]'>
          {props.title}
        </h1>
        <p className='text-muted-foreground text-base leading-relaxed'>
          {props.description}
        </p>
        {props.actions && (
          <div className='mt-7 flex justify-center gap-3'>{props.actions}</div>
        )}
        {props.footnote && (
          <div className='text-muted-foreground mt-7 font-mono text-xs'>
            {props.footnote}
          </div>
        )}
      </div>
    </div>
  )
}
