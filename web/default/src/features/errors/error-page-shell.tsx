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
        'bg-background text-foreground relative flex min-h-svh w-full items-center justify-center overflow-hidden px-6',
        props.className
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[10px]'
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--brand) 12%, transparent), transparent 62%)',
        }}
      />
      <div className='relative max-w-md text-center'>
        <div className='bg-brand-subtle text-brand mx-auto mb-7 flex size-16 items-center justify-center rounded-xl'>
          <Icon className='size-8' aria-hidden='true' />
        </div>
        <div className='font-display text-text-strong text-[6rem] leading-none font-bold tracking-[-0.04em]'>
          {props.code}
        </div>
        <h1 className='font-display text-text-strong mt-4 mb-2 text-2xl font-semibold tracking-[-0.02em]'>
          {props.title}
        </h1>
        <p className='text-text-secondary text-base leading-relaxed'>
          {props.description}
        </p>
        {props.actions && (
          <div className='mt-7 flex flex-wrap justify-center gap-3'>
            {props.actions}
          </div>
        )}
        {props.footnote && (
          <div className='text-text-muted mt-7 font-mono text-xs'>
            {props.footnote}
          </div>
        )}
      </div>
    </div>
  )
}
