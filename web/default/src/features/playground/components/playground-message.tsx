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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector,
} from '@/components/ai-elements/branch'
import {
  MessageContent,
  SpeakerMessage,
} from '@/components/ai-elements/message'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import { Response } from '@/components/ai-elements/response'
import { Shimmer } from '@/components/ai-elements/shimmer'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources'
import { StreamingCursor } from '@/components/ai-elements/streaming-cursor'
import { TypingDots } from '@/components/ai-elements/typing-dots'
import { MESSAGE_ROLES } from '../constants'
import { getMessageContentStyles } from '../lib/message-styles'
import {
  getActiveVersionIndex,
  getCurrentVersion,
  parseThinkTags,
} from '../lib/message-utils'
import type { Message as MessageType, ToolCall } from '../types'
import { MessageActions } from './message-actions'
import { MessageError } from './message-error'

interface PlaygroundMessageProps {
  message: MessageType
  modelLabel?: string
  userInitials: string
  isLatestTurn: boolean
  isGenerating: boolean
  isEditing: boolean
  editText: string
  onEditTextChange: (value: string) => void
  editEmpty: boolean
  editChanged: boolean
  onSaveEdit?: (newContent: string) => void
  onSaveEditAndSubmit?: (newContent: string) => void
  onCancelEdit?: (open: boolean) => void
  onCopyMessage?: (message: MessageType) => void
  onRegenerateMessage?: (message: MessageType) => void
  onEditMessage?: (message: MessageType) => void
  onDeleteMessage?: (message: MessageType) => void
  /** Submit tool results for pending tool_calls and continue. */
  onSubmitToolResults?: (
    message: MessageType,
    results: Array<{ toolCallId: string; toolName: string; result: string }>
  ) => void
  onActiveVersionChange?: (messageKey: string, index: number) => void
}

function ToolCallsBlock({
  toolCalls,
  isLatestTurn,
  isGenerating,
  onSubmit,
}: {
  toolCalls: ToolCall[]
  isLatestTurn: boolean
  isGenerating: boolean
  onSubmit?: (
    results: Array<{ toolCallId: string; toolName: string; result: string }>
  ) => void
}) {
  const { t } = useTranslation()
  const [results, setResults] = useState<Record<string, string>>(() =>
    Object.fromEntries(toolCalls.map((tc) => [tc.id, '']))
  )

  return (
    <div className='border-border bg-surface-inset my-2 space-y-3 rounded-md border p-3'>
      <div className='text-muted-foreground flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide'>
        <Wrench className='size-3.5' />
        {t('Tool calls')}
      </div>
      {toolCalls.map((tc) => (
        <div key={tc.id} className='space-y-1.5'>
          <div className='text-foreground font-mono text-xs font-medium'>
            {tc.function.name}
            <span className='text-muted-foreground ms-2 text-[10px]'>
              {tc.id}
            </span>
          </div>
          <pre className='bg-background overflow-x-auto rounded border p-2 font-mono text-[11px]'>
            {tc.function.arguments || '{}'}
          </pre>
          {isLatestTurn && onSubmit && (
            <Textarea
              value={results[tc.id] ?? ''}
              onChange={(e) =>
                setResults((prev) => ({ ...prev, [tc.id]: e.target.value }))
              }
              placeholder={t('Tool result (JSON or text)…')}
              className='min-h-16 font-mono text-xs'
              disabled={isGenerating}
            />
          )}
        </div>
      ))}
      {isLatestTurn && onSubmit && (
        <Button
          size='sm'
          disabled={
            isGenerating ||
            toolCalls.some((tc) => !(results[tc.id] ?? '').trim())
          }
          onClick={() =>
            onSubmit(
              toolCalls.map((tc) => ({
                toolCallId: tc.id,
                toolName: tc.function.name,
                result: results[tc.id] ?? '',
              }))
            )
          }
        >
          {t('Submit tool results & continue')}
        </Button>
      )}
    </div>
  )
}

/**
 * Renders a single playground message (user, assistant, or tool).
 */
export function PlaygroundMessage({
  message,
  modelLabel,
  userInitials,
  isLatestTurn,
  isGenerating,
  isEditing,
  editText,
  onEditTextChange,
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
}: PlaygroundMessageProps) {
  const { t } = useTranslation()
  const versions = message.versions ?? []
  const isAssistant = message.from === MESSAGE_ROLES.ASSISTANT
  const isTool = message.from === MESSAGE_ROLES.TOOL
  const defaultBranch = getActiveVersionIndex(message)

  if (isTool) {
    return (
      <SpeakerMessage from='assistant' tile='⚙' speaker={t('Tool')}>
        <div className='w-full min-w-0'>
          <div className='text-muted-foreground mb-1 font-mono text-[11px]'>
            {message.toolName || 'tool'} · {message.toolCallId}
          </div>
          <MessageContent variant='flat' className={cn(getMessageContentStyles())}>
            <Response>{getCurrentVersion(message).content}</Response>
          </MessageContent>
          <MessageActions
            message={message}
            onDelete={onDeleteMessage}
            isGenerating={isGenerating}
            alwaysVisible={isLatestTurn}
            className='mt-1'
          />
        </div>
      </SpeakerMessage>
    )
  }

  return (
    <Branch
      defaultBranch={defaultBranch}
      onBranchChange={(index) => onActiveVersionChange?.(message.key, index)}
    >
      <BranchMessages>
        {versions.map((version, versionIndex) => {
          const hasSources = !!message.sources?.length
          const versionReasoning =
            version.reasoning?.content ||
            (versionIndex === defaultBranch
              ? message.reasoning?.content
              : undefined)
          const showReasoning = isAssistant && !!versionReasoning
          const toolCalls =
            version.toolCalls?.length
              ? version.toolCalls
              : versionIndex === defaultBranch
                ? message.toolCalls
                : undefined
          const showLoader =
            isAssistant &&
            !message.isReasoningStreaming &&
            versionIndex === defaultBranch &&
            (message.status === 'loading' ||
              (message.status === 'streaming' &&
                !version.content &&
                !toolCalls?.length))
          const showMessageContent =
            (message.from === MESSAGE_ROLES.USER ||
              !message.isReasoningStreaming) &&
            !!version.content
          const displayContent = isAssistant
            ? parseThinkTags(version.content).visibleContent
            : version.content
          const refusal =
            version.refusal ||
            (versionIndex === defaultBranch ? message.refusal : undefined)

          const actions = (
            <MessageActions
              message={message}
              onCopy={onCopyMessage}
              onRegenerate={onRegenerateMessage}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              isGenerating={isGenerating}
              alwaysVisible={isLatestTurn && isAssistant}
              className='mt-1'
            />
          )

          return (
            <SpeakerMessage
              from={message.from === 'tool' ? 'assistant' : message.from}
              tile={message.from === MESSAGE_ROLES.USER ? userInitials : '✦'}
              speaker={
                message.from === MESSAGE_ROLES.USER
                  ? t('You')
                  : modelLabel || t('Assistant')
              }
              key={`${message.key}-${version.id}-${versionIndex}`}
            >
              <div className='w-full min-w-0'>
                {isEditing && versionIndex === defaultBranch ? (
                  <div className='space-y-2'>
                    <Textarea
                      value={editText}
                      onChange={(e) => onEditTextChange(e.target.value)}
                      className='font-mono text-sm'
                      rows={8}
                    />
                    <div className='flex gap-2'>
                      {message.from === MESSAGE_ROLES.USER && (
                        <Button
                          size='sm'
                          onClick={() => onSaveEditAndSubmit?.(editText)}
                          disabled={editEmpty || !editChanged}
                        >
                          {t('Save & Submit')}
                        </Button>
                      )}
                      <Button
                        size='sm'
                        onClick={() => onSaveEdit?.(editText)}
                        disabled={editEmpty || !editChanged}
                      >
                        {t('Save')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onCancelEdit?.(false)}
                      >
                        {t('Cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {hasSources && versionIndex === defaultBranch && (
                      <Sources>
                        <SourcesTrigger count={message.sources!.length} />
                        <SourcesContent>
                          {message.sources!.map((source, sourceIndex) => (
                            <Source
                              href={source.href}
                              key={`${message.key}-source-${sourceIndex}`}
                              title={source.title}
                            />
                          ))}
                        </SourcesContent>
                      </Sources>
                    )}

                    {showReasoning && (
                      <Reasoning
                        defaultOpen={true}
                        isStreaming={
                          versionIndex === defaultBranch &&
                          !!message.isReasoningStreaming
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{versionReasoning}</ReasoningContent>
                      </Reasoning>
                    )}

                    {!!message.imageUrls?.length &&
                      message.from === MESSAGE_ROLES.USER && (
                        <div className='mb-1 flex flex-wrap gap-2'>
                          {message.imageUrls.map((url, imageIndex) => (
                            <a
                              key={`${message.key}-img-${imageIndex}`}
                              href={url}
                              target='_blank'
                              rel='noreferrer'
                            >
                              <img
                                src={url}
                                alt={t('Attached image')}
                                className='h-20 w-20 rounded-md border object-cover'
                              />
                            </a>
                          ))}
                        </div>
                      )}

                    {showLoader && (
                      <div className='flex items-center gap-2 py-2'>
                        <TypingDots className='text-brand' />
                        <Shimmer className='text-sm' duration={1}>
                          {t('Responding...')}
                        </Shimmer>
                      </div>
                    )}

                    {message.status === 'error' &&
                    versionIndex === defaultBranch ? (
                      <>
                        <MessageError message={message} className='mb-2' />
                        {actions}
                      </>
                    ) : (
                      <>
                        {refusal && (
                          <div className='text-destructive mb-2 text-sm'>
                            {t('Refusal')}: {refusal}
                          </div>
                        )}
                        {message.status === 'truncated' &&
                          versionIndex === defaultBranch && (
                            <div className='text-muted-foreground mb-1 font-mono text-[11px]'>
                              {t('Generation interrupted')}
                            </div>
                          )}
                        {!!toolCalls?.length && (
                          <ToolCallsBlock
                            toolCalls={toolCalls}
                            isLatestTurn={
                              isLatestTurn && versionIndex === defaultBranch
                            }
                            isGenerating={isGenerating}
                            onSubmit={
                              onSubmitToolResults
                                ? (results) =>
                                    onSubmitToolResults(message, results)
                                : undefined
                            }
                          />
                        )}
                        {showMessageContent && (
                          <>
                            <MessageContent
                              variant='flat'
                              className={cn(getMessageContentStyles())}
                            >
                              <Response>{displayContent}</Response>
                              {message.status === 'streaming' &&
                                versionIndex === defaultBranch && (
                                  <StreamingCursor />
                                )}
                            </MessageContent>
                            {actions}
                          </>
                        )}
                        {!showMessageContent &&
                          !!toolCalls?.length &&
                          versionIndex === defaultBranch &&
                          actions}
                      </>
                    )}
                  </>
                )}
              </div>
            </SpeakerMessage>
          )
        })}
      </BranchMessages>

      {versions.length > 1 && (
        <BranchSelector className='px-0' from={message.from === 'tool' ? 'assistant' : message.from}>
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      )}
    </Branch>
  )
}
