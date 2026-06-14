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
import { parseThinkTags } from '../lib/message-utils'
import type { Message as MessageType } from '../types'
import { MessageActions } from './message-actions'
import { MessageError } from './message-error'

interface PlaygroundMessageProps {
  message: MessageType
  /** Assistant speaker label (model name / display label). */
  modelLabel?: string
  userInitials: string
  /** Whether this message belongs to the most recent turn (keeps actions shown). */
  isLatestTurn: boolean
  isGenerating: boolean
  // Editing
  isEditing: boolean
  editText: string
  onEditTextChange: (value: string) => void
  editEmpty: boolean
  editChanged: boolean
  onSaveEdit?: (newContent: string) => void
  onSaveEditAndSubmit?: (newContent: string) => void
  onCancelEdit?: (open: boolean) => void
  // Actions
  onCopyMessage?: (message: MessageType) => void
  onRegenerateMessage?: (message: MessageType) => void
  onEditMessage?: (message: MessageType) => void
  onDeleteMessage?: (message: MessageType) => void
}

/**
 * Renders a single playground message (user or assistant), including reasoning,
 * sources, attached images, loader, error and inline editing. Extracted from
 * PlaygroundChat so the side-by-side compare view can place one of these per
 * model column.
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
}: PlaygroundMessageProps) {
  const { t } = useTranslation()
  const { versions = [] } = message
  const isAssistant = message.from === MESSAGE_ROLES.ASSISTANT

  return (
    <Branch defaultBranch={0}>
      <BranchMessages>
        {versions.map((version, versionIndex) => {
          const hasSources = !!message.sources?.length
          const showReasoning = isAssistant && !!message.reasoning?.content
          const showLoader =
            isAssistant &&
            !message.isReasoningStreaming &&
            (message.status === 'loading' ||
              (message.status === 'streaming' && !version.content))
          const showMessageContent =
            (message.from === MESSAGE_ROLES.USER ||
              !message.isReasoningStreaming) &&
            !!version.content
          const displayContent = isAssistant
            ? parseThinkTags(version.content).visibleContent
            : version.content

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
              from={message.from}
              tile={message.from === MESSAGE_ROLES.USER ? userInitials : '✦'}
              speaker={
                message.from === MESSAGE_ROLES.USER
                  ? t('You')
                  : modelLabel || t('Assistant')
              }
              key={`${message.key}-${version.id}-${versionIndex}`}
            >
              <div className='w-full min-w-0'>
                {isEditing ? (
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
                    {/* Sources */}
                    {hasSources && (
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

                    {/* Reasoning */}
                    {showReasoning && (
                      <Reasoning
                        defaultOpen={true}
                        isStreaming={message.isReasoningStreaming}
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {message.reasoning!.content}
                        </ReasoningContent>
                      </Reasoning>
                    )}

                    {/* Attached images (vision input) */}
                    {!!message.imageUrls?.length && (
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

                    {/* Typing indicator (before the first token) */}
                    {showLoader && (
                      <div className='flex items-center gap-2 py-2'>
                        <TypingDots className='text-brand' />
                        <Shimmer className='text-sm' duration={1}>
                          {t('Responding...')}
                        </Shimmer>
                      </div>
                    )}

                    {/* Error or Content */}
                    {message.status === 'error' ? (
                      <>
                        <MessageError message={message} className='mb-2' />
                        {actions}
                      </>
                    ) : (
                      showMessageContent && (
                        <>
                          <MessageContent
                            variant='flat'
                            className={cn(getMessageContentStyles())}
                          >
                            <Response>{displayContent}</Response>
                            {message.status === 'streaming' && (
                              <StreamingCursor />
                            )}
                          </MessageContent>
                          {actions}
                        </>
                      )
                    )}
                  </>
                )}
              </div>
            </SpeakerMessage>
          )
        })}
      </BranchMessages>

      {/* Branch selector for multiple versions */}
      {versions.length > 1 && (
        <BranchSelector className='px-0' from={message.from}>
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      )}
    </Branch>
  )
}
