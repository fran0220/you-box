import { useEffect, useMemo, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { MOTION_TRANSITION } from '@/lib/motion'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { MESSAGE_ROLES } from '../constants'
import { getCurrentVersion } from '../lib/message-utils'
import type { Message as MessageType } from '../types'
import { PlaygroundMessage } from './playground-message'

interface PlaygroundChatProps {
  messages: MessageType[]
  /** Display name of the currently selected model (compare column fallback). */
  modelLabel?: string
  onCopyMessage?: (message: MessageType) => void
  onRegenerateMessage?: (message: MessageType) => void
  onEditMessage?: (message: MessageType) => void
  onDeleteMessage?: (message: MessageType) => void
  onSubmitToolResults?: (
    message: MessageType,
    results: Array<{ toolCallId: string; toolName: string; result: string }>
  ) => void
  onActiveVersionChange?: (messageKey: string, index: number) => void
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

export function PlaygroundChat({
  messages,
  modelLabel,
  onCopyMessage,
  onRegenerateMessage,
  onEditMessage,
  onDeleteMessage,
  onSubmitToolResults,
  onActiveVersionChange,
  isGenerating = false,
  editingKey,
  onSaveEdit,
  onCancelEdit,
  onSaveEditAndSubmit,
}: PlaygroundChatProps) {
  const { t } = useTranslation()
  const shouldReduce = useReducedMotion()
  const [editText, setEditText] = useState('')
  const [originalText, setOriginalText] = useState('')

  useEffect(() => {
    if (!editingKey) return
    const message = messages.find((m) => m.key === editingKey)
    const content = message ? getCurrentVersion(message).content : ''
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
    onSubmitToolResults,
    onActiveVersionChange,
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
        <div className='mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6'>
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
                    className='bg-surface-2/60 border-border min-w-0 rounded-lg border p-3'
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
                      className='text-muted-foreground mb-1 truncate font-mono text-[11px]'
                      title={message.model || modelLabel}
                    >
                      {message.model || modelLabel || t('Assistant')}
                    </div>
                    <PlaygroundMessage
                      {...sharedMessageProps(message, isLatestTurn)}
                    />
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
