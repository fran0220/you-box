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
import { useEffect, useMemo, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { MOTION_TRANSITION } from '@/lib/motion'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { MESSAGE_ROLES } from '../constants'
import { formatCostUsd } from '../lib/cost'
import type { Message as MessageType } from '../types'
import { PlaygroundMessage } from './playground-message'

interface PlaygroundChatProps {
  messages: MessageType[]
  /** Display name of the currently selected model (assistant speaker label). */
  modelLabel?: string
  onCopyMessage?: (message: MessageType) => void
  onRegenerateMessage?: (message: MessageType) => void
  onEditMessage?: (message: MessageType) => void
  onDeleteMessage?: (message: MessageType) => void
  isGenerating?: boolean
  editingKey?: string | null
  onSaveEdit?: (newContent: string) => void
  onCancelEdit?: (open: boolean) => void
  onSaveEditAndSubmit?: (newContent: string) => void
}

type ChatRow =
  | { kind: 'single'; message: MessageType }
  | { kind: 'group'; messages: MessageType[] }

/** Group consecutive assistant messages into a turn (one entry per model). */
function buildRows(messages: MessageType[]): ChatRow[] {
  const rows: ChatRow[] = []
  let group: MessageType[] = []
  const flush = () => {
    if (group.length) {
      rows.push({ kind: 'group', messages: group })
      group = []
    }
  }
  for (const message of messages) {
    if (message.from === MESSAGE_ROLES.ASSISTANT) {
      group.push(message)
    } else {
      flush()
      rows.push({ kind: 'single', message })
    }
  }
  flush()
  return rows
}

/** Compact per-response meta line (model compare columns). */
function ResponseMeta({ message }: { message: MessageType }) {
  const { t } = useTranslation()
  const parts: string[] = []
  if (message.usage?.total_tokens != null) {
    parts.push(`${message.usage.total_tokens.toLocaleString()} ${t('tokens')}`)
  }
  if (message.costUsd != null) {
    parts.push(formatCostUsd(message.costUsd))
  }
  if (message.latencyMs != null) {
    parts.push(`${(message.latencyMs / 1000).toFixed(2)}s`)
  }
  if (parts.length === 0) return null
  return (
    <div className='text-muted-foreground mt-2 text-[11px]'>
      {parts.join(' · ')}
    </div>
  )
}

export function PlaygroundChat({
  messages,
  modelLabel,
  onCopyMessage,
  onRegenerateMessage,
  onEditMessage,
  onDeleteMessage,
  isGenerating = false,
  editingKey,
  onSaveEdit,
  onCancelEdit,
  onSaveEditAndSubmit,
}: PlaygroundChatProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const shouldReduce = useReducedMotion()
  const [editText, setEditText] = useState('')
  const [originalText, setOriginalText] = useState('')

  const userInitials = (user?.username || '').slice(0, 2).toUpperCase() || 'ME'

  useEffect(() => {
    if (!editingKey) return
    const message = messages.find((m) => m.key === editingKey)
    const content = message?.versions?.[0]?.content || ''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditText(content)
    setOriginalText(content)
  }, [editingKey, messages])

  const editEmpty = useMemo(() => !editText.trim(), [editText])
  const editChanged = useMemo(
    () => editText !== originalText,
    [editText, originalText]
  )

  const rows = useMemo(() => buildRows(messages), [messages])
  // Index of the last assistant group → its messages keep actions visible.
  const lastGroupIndex = useMemo(() => {
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].kind === 'group') return i
    }
    return -1
  }, [rows])

  const sharedMessageProps = (message: MessageType, isLatestTurn: boolean) => ({
    message,
    userInitials,
    isLatestTurn,
    isGenerating,
    isEditing: editingKey === message.key,
    editText,
    onEditTextChange: setEditText,
    editEmpty,
    editChanged,
    onSaveEdit,
    onSaveEditAndSubmit,
    onCancelEdit,
    onCopyMessage,
    onRegenerateMessage,
    onEditMessage,
    onDeleteMessage,
  })

  // Per-message mount reveal (opacity + small rise). Transform/opacity only so
  // it never changes layout and can't fight the stick-to-bottom auto-scroll;
  // keyed by message.key so it plays once on mount, not on each streaming token.
  const reveal = shouldReduce
    ? undefined
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: MOTION_TRANSITION.default,
      }

  return (
    <Conversation>
      <ConversationContent className='p-0'>
        <div className='mx-auto w-full max-w-4xl space-y-6 px-4 py-4'>
          {messages.length === 0 && !isGenerating && (
            <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center'>
              <MessagesSquare className='text-muted-foreground h-12 w-12' />
              <div className='space-y-1'>
                <h2 className='text-lg font-semibold'>
                  {t('Start a conversation')}
                </h2>
                <p className='text-muted-foreground'>
                  {t(
                    'Pick a model, tune the parameters, and send a message below — responses stream here.'
                  )}
                </p>
              </div>
            </div>
          )}

          {rows.map((row, rowIndex) => {
            if (row.kind === 'single') {
              return (
                <m.div
                  key={row.message.key}
                  initial={reveal?.initial}
                  animate={reveal?.animate}
                  transition={reveal?.transition}
                >
                  <PlaygroundMessage
                    modelLabel={modelLabel}
                    {...sharedMessageProps(row.message, false)}
                  />
                </m.div>
              )
            }

            const isLatestTurn = rowIndex === lastGroupIndex
            // Single assistant response → render inline (single-model mode).
            if (row.messages.length === 1) {
              const message = row.messages[0]
              return (
                <m.div
                  key={message.key}
                  initial={reveal?.initial}
                  animate={reveal?.animate}
                  transition={reveal?.transition}
                >
                  <PlaygroundMessage
                    modelLabel={message.model || modelLabel}
                    {...sharedMessageProps(message, isLatestTurn)}
                  />
                </m.div>
              )
            }

            // Multiple responses → side-by-side compare columns (staggered in).
            return (
              <div
                key={`group-${row.messages[0].key}`}
                className='grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3'
              >
                {row.messages.map((message, colIndex) => (
                  <m.div
                    key={message.key}
                    className='bg-surface/40 min-w-0 rounded-lg border p-3'
                    initial={reveal?.initial}
                    animate={reveal?.animate}
                    transition={
                      reveal
                        ? {
                            ...MOTION_TRANSITION.default,
                            delay: colIndex * 0.06,
                          }
                        : undefined
                    }
                  >
                    <div
                      className='text-muted-foreground mb-1 truncate text-xs font-medium'
                      title={message.model || modelLabel}
                    >
                      {message.model || modelLabel || t('Assistant')}
                    </div>
                    <PlaygroundMessage
                      modelLabel={message.model || modelLabel}
                      {...sharedMessageProps(message, isLatestTurn)}
                    />
                    <ResponseMeta message={message} />
                  </m.div>
                ))}
              </div>
            )
          })}
        </div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
