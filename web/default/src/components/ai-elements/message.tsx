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
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react'
import type { UIMessage } from 'ai'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role']
}

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-end justify-end gap-2',
      from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse justify-end',
      className
    )}
    {...props}
  />
)

const messageContentVariants = cva(
  'is-user:dark flex flex-col gap-2 overflow-hidden rounded-lg text-sm',
  {
    variants: {
      variant: {
        contained: [
          'max-w-[100%] px-3 py-1',
          'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground',
          'group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground',
        ],
        flat: [
          'group-[.is-user]:max-w-[80%] group-[.is-user]:bg-secondary group-[.is-user]:px-3 group-[.is-user]:py-1 group-[.is-user]:text-foreground',
          'group-[.is-assistant]:text-foreground',
        ],
      },
    },
    defaultVariants: {
      variant: 'contained',
    },
  }
)

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
)

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string
  name?: string
}

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn('ring-border size-8 ring-1', className)} {...props}>
    <AvatarImage alt='' className='mt-0 mb-0' src={src} />
    <AvatarFallback>{name?.slice(0, 2) || 'ME'}</AvatarFallback>
  </Avatar>
)

/* ---- R2-A5 speaker anatomy ------------------------------------------ */

const messageTileVariants = cva(
  'flex size-7 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-semibold select-none',
  {
    variants: {
      role: {
        user: 'bg-surface-3 text-foreground border',
        assistant: 'bg-brand-subtle text-brand',
        system: 'bg-surface-3 text-muted-foreground border',
      },
    },
    defaultVariants: { role: 'assistant' },
  }
)

export type MessageTileProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof messageTileVariants>

/**
 * Role avatar tile (R2-A5): user = surface-3 initials,
 * assistant = brand-subtle glyph (✦).
 */
export const MessageTile = ({ role, className, ...props }: MessageTileProps) => (
  <span
    aria-hidden='true'
    className={cn(messageTileVariants({ role }), className)}
    {...props}
  />
)

export type SpeakerMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role']
  /** Tile content: initials for users, ✦ for the assistant. */
  tile: ReactNode
  /** Speaker label: "You" / model display name. */
  speaker: ReactNode
}

/**
 * SpeakerMessage (R2-A5): the YouBox conversation anatomy — role tile +
 * bold speaker label + full-width content column. Complements the
 * bubble-style Message for playground/chat redesigns.
 */
export const SpeakerMessage = ({
  from,
  tile,
  speaker,
  className,
  children,
  ...props
}: SpeakerMessageProps) => (
  <div
    className={cn(
      'group flex w-full items-start gap-3',
      from === 'user' ? 'is-user' : 'is-assistant',
      className
    )}
    {...props}
  >
    <MessageTile role={from === 'user' ? 'user' : 'assistant'}>
      {tile}
    </MessageTile>
    <div className='min-w-0 flex-1'>
      <div className='text-foreground mb-1 text-[13px] leading-7 font-semibold'>
        {speaker}
      </div>
      <div className='text-foreground/90 text-sm leading-relaxed'>
        {children}
      </div>
    </div>
  </div>
)
