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
import { Message, MessageContent } from '@/components/ai-elements/message'
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
 * Renders a single playground message with the Claude-style anatomy:
 * user turns are right-aligned paper bubbles, assistant turns are flat
 * editorial text on the page, tool results are compact mono blocks.
 */
export function PlaygroundMessage({
  message,
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
  const isUser = message.from === MESSAGE_ROLES.USER
  const isTool = message.from === MESSAGE_ROLES.TOOL
  const defaultBranch = getActiveVersionIndex(message)

  const contentStyles = cn(
    getMessageContentStyles(),
    'group-[.is-user]:px-4 group-[.is-user]:py-2.5'
  )

  if (isTool) {
    return (
      <Message from='assistant'>
        <div className='w-full min-w-0'>
          <div className='border-border/70 bg-surface-inset rounded-lg border p-3'>
            <div className='text-muted-foreground mb-1 font-mono text-[11px]'>
              {t('Tool')} · {message.toolName || 'tool'} · {message.toolCallId}
            </div>
            <MessageContent variant='flat' className={contentStyles}>
              <Response>{getCurrentVersion(message).content}</Response>
            </MessageContent>
          </div>
          <MessageActions
            message={message}
            onDelete={onDeleteMessage}
            isGenerating={isGenerating}
            alwaysVisible={isLatestTurn}
            className='mt-1'
          />
        </div>
      </Message>
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
              className={cn('mt-1', isUser && 'justify-end')}
            />
          )

          return (
            <Message
              from={message.from === 'tool' ? 'assistant' : message.from}
              key={`${message.key}-${version.id}-${versionIndex}`}
            >
              <div
                className={cn(
                  'w-full min-w-0',
                  isUser && 'flex flex-col items-end'
                )}
              >
                {isEditing && versionIndex === defaultBranch ? (
                  <div className='border-border bg-surface w-full space-y-2 rounded-xl border p-3'>
                    <Textarea
                      value={editText}
                      onChange={(e) => onEditTextChange(e.target.value)}
                      className='border-0 p-1 text-sm shadow-none focus-visible:ring-0'
                      rows={6}
                    />
                    <div className='flex justify-end gap-2'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => onCancelEdit?.(false)}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onSaveEdit?.(editText)}
                        disabled={editEmpty || !editChanged}
                      >
                        {t('Save')}
                      </Button>
                      {message.from === MESSAGE_ROLES.USER && (
                        <Button
                          size='sm'
                          onClick={() => onSaveEditAndSubmit?.(editText)}
                          disabled={editEmpty || !editChanged}
                        >
                          {t('Save & Submit')}
                        </Button>
                      )}
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
                        <div className='mb-1 flex flex-wrap justify-end gap-2'>
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
                              className={contentStyles}
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
            </Message>
          )
        })}
      </BranchMessages>

      {versions.length > 1 && (
        <BranchSelector
          className='px-0'
          from={message.from === 'tool' ? 'assistant' : message.from}
        >
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      )}
    </Branch>
  )
}
