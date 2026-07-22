import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DemoBlockProps = {
  title: string
  description?: string
  /** Stretch demo content edge-to-edge (tables, full-width panels). */
  bleed?: boolean
  children: ReactNode
}

/**
 * Container for a single Design Lab demo: a named card holding one
 * component's variants/states. Every Phase A component must be shown
 * through one or more DemoBlocks so review happens in the gallery.
 */
export function DemoBlock({
  title,
  description,
  bleed,
  children,
}: DemoBlockProps) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border'>
      <div className='border-divider flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-2.5'>
        <h3 className='font-display text-sm font-semibold tracking-[-0.01em]'>
          {title}
        </h3>
        {description ? (
          <p className='text-muted-foreground text-xs'>{description}</p>
        ) : null}
      </div>
      <div className={cn(bleed ? '' : 'p-4')}>{children}</div>
    </div>
  )
}

type DemoRowProps = {
  label: string
  children: ReactNode
  className?: string
}

/** A labeled row inside a DemoBlock — one variant or state per row. */
export function DemoRow({ label, children, className }: DemoRowProps) {
  return (
    <div className='flex flex-col gap-2 not-last:mb-5'>
      <span className='text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase'>
        {label}
      </span>
      <div className={cn('flex flex-wrap items-start gap-3', className)}>
        {children}
      </div>
    </div>
  )
}
