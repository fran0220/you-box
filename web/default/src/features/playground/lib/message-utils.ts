import i18next from 'i18next'
import { nanoid } from 'nanoid'
import { MESSAGE_ROLES, MESSAGE_STATUS, ERROR_MESSAGES } from '../constants'
import type {
  Message,
  MessageVersion,
  ChatCompletionMessage,
  ContentPart,
  ToolCall,
} from '../types'

/**
 * Create a new message version
 */
export function createMessageVersion(
  content: string,
  extras?: Partial<MessageVersion>
): MessageVersion {
  return {
    id: nanoid(),
    content,
    ...extras,
  }
}

/**
 * Active version index (defaults to last version for regenerate branches).
 */
export function getActiveVersionIndex(message: Message): number {
  if (!message.versions.length) return 0
  if (
    message.activeVersionIndex != null &&
    message.activeVersionIndex >= 0 &&
    message.activeVersionIndex < message.versions.length
  ) {
    return message.activeVersionIndex
  }
  return message.versions.length - 1
}

/**
 * Get current (active) version from message
 */
export function getCurrentVersion(message: Message): MessageVersion {
  const idx = getActiveVersionIndex(message)
  return message.versions[idx] || { id: 'default', content: '' }
}

/**
 * Update active version content in message
 */
export function updateCurrentVersionContent(
  message: Message,
  content: string
): Message {
  const idx = getActiveVersionIndex(message)
  const versions = message.versions.map((v, i) =>
    i === idx ? { ...v, content } : v
  )
  return {
    ...message,
    versions,
  }
}

/**
 * Create a user message
 */
export function createUserMessage(
  content: string,
  imageUrls: string[] = []
): Message {
  const validImages = imageUrls.filter((url) => url.trim() !== '')
  return {
    key: nanoid(),
    from: MESSAGE_ROLES.USER,
    versions: [createMessageVersion(content)],
    ...(validImages.length > 0 ? { imageUrls: validImages } : {}),
  }
}

/**
 * Create a tool-result message answering a prior tool_call.
 */
export function createToolResultMessage(
  toolCallId: string,
  toolName: string,
  result: string
): Message {
  return {
    key: nanoid(),
    from: MESSAGE_ROLES.TOOL,
    toolCallId,
    toolName,
    versions: [createMessageVersion(result)],
    status: MESSAGE_STATUS.COMPLETE,
  }
}

/**
 * Create a loading assistant message, optionally tagged with the model that
 * will produce it (used by the side-by-side compare view).
 */
export function createLoadingAssistantMessage(model?: string): Message {
  return {
    key: nanoid(),
    from: MESSAGE_ROLES.ASSISTANT,
    versions: [createMessageVersion('')],
    activeVersionIndex: 0,
    reasoning: undefined,
    toolCalls: undefined,
    isReasoningComplete: false,
    isContentComplete: false,
    isReasoningStreaming: false,
    status: MESSAGE_STATUS.LOADING,
    ...(model ? { model } : {}),
  }
}

/**
 * Push a new empty version onto an assistant message for regenerate (branch).
 * Returns the updated message with the new version active.
 */
export function pushAssistantVersion(message: Message): Message {
  const versions = [...message.versions, createMessageVersion('')]
  return {
    ...message,
    versions,
    activeVersionIndex: versions.length - 1,
    reasoning: undefined,
    toolCalls: undefined,
    refusal: undefined,
    finishReason: undefined,
    isReasoningComplete: false,
    isContentComplete: false,
    isReasoningStreaming: false,
    status: MESSAGE_STATUS.LOADING,
    usage: undefined,
    costUsd: undefined,
    latencyMs: undefined,
    errorCode: null,
  }
}

/**
 * Build message content with optional images
 */
export function buildMessageContent(
  text: string,
  imageUrls: string[] = []
): string | ContentPart[] {
  const validImages = imageUrls.filter((url) => url.trim() !== '')

  if (validImages.length === 0) {
    return text
  }

  const parts: ContentPart[] = [
    {
      type: 'text',
      text: text || '',
    },
    ...validImages.map((url) => ({
      type: 'image_url' as const,
      image_url: { url: url.trim() },
    })),
  ]

  return parts
}

/**
 * Extract text content from message content
 */
export function getTextContent(content: string | ContentPart[]): string {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    const textPart = content.find((part) => part.type === 'text')
    return textPart?.text || ''
  }

  return ''
}

/**
 * Format message for API request (uses active version).
 */
export function formatMessageForAPI(message: Message): ChatCompletionMessage {
  const currentVersion = getCurrentVersion(message)

  if (message.from === MESSAGE_ROLES.TOOL) {
    return {
      role: 'tool',
      content: currentVersion.content,
      tool_call_id: message.toolCallId || '',
      ...(message.toolName ? { name: message.toolName } : {}),
    }
  }

  const toolCalls =
    currentVersion.toolCalls?.length
      ? currentVersion.toolCalls
      : message.toolCalls

  const base: ChatCompletionMessage = {
    role: message.from === 'system' ? 'system' : message.from,
    content: buildMessageContent(currentVersion.content, message.imageUrls),
  }

  if (message.from === MESSAGE_ROLES.ASSISTANT && toolCalls?.length) {
    // OpenAI allows content null when only tool_calls are present.
    const text = currentVersion.content?.trim()
    return {
      ...base,
      content: text ? base.content : null,
      tool_calls: toolCalls,
    }
  }

  return base
}

/**
 * Check if message is valid for API request
 * Excludes loading/streaming assistant messages and empty content
 * (except assistant with tool_calls or tool role with result).
 */
export function isValidMessage(message: Message): boolean {
  if (!message || !message.from || !message.versions.length) return false

  if (
    message.status === MESSAGE_STATUS.LOADING ||
    message.status === MESSAGE_STATUS.STREAMING
  ) {
    return false
  }

  const current = getCurrentVersion(message)
  const content = current.content

  if (message.from === MESSAGE_ROLES.TOOL) {
    return !!message.toolCallId && content !== undefined
  }

  if (message.from === MESSAGE_ROLES.ASSISTANT) {
    const toolCalls = current.toolCalls?.length
      ? current.toolCalls
      : message.toolCalls
    if (toolCalls?.length) return true
    if (!content?.trim() && !message.refusal) return false
    return true
  }

  if (content === undefined) return false
  return true
}

/**
 * Parse content to separate thinking from visible text
 * Handles both complete and incomplete <think> tags
 */
export function parseThinkTags(content: string): {
  visibleContent: string
  reasoning: string
  hasUnclosedTag: boolean
} {
  if (!content.includes('<think>')) {
    return { visibleContent: content, reasoning: '', hasUnclosedTag: false }
  }

  const visibleParts: string[] = []
  const reasoningParts: string[] = []
  let currentPos = 0
  let hasUnclosed = false

  while (true) {
    const openPos = content.indexOf('<think>', currentPos)

    if (openPos === -1) {
      if (currentPos < content.length) {
        visibleParts.push(content.substring(currentPos))
      }
      break
    }

    if (openPos > currentPos) {
      visibleParts.push(content.substring(currentPos, openPos))
    }

    const closePos = content.indexOf('</think>', openPos + 7)

    if (closePos === -1) {
      reasoningParts.push(content.substring(openPos + 7))
      hasUnclosed = true
      break
    }

    reasoningParts.push(content.substring(openPos + 7, closePos))
    currentPos = closePos + 8
  }

  return {
    visibleContent: visibleParts.join('').trim(),
    reasoning: reasoningParts.join('\n\n').trim(),
    hasUnclosedTag: hasUnclosed,
  }
}

export function updateAssistantMessageWithError(
  messages: Message[],
  errorMessage: string,
  errorCode?: string
): Message[] {
  return updateLastAssistantMessage(messages, (message) => {
    const updatedMessage = updateCurrentVersionContent(
      message,
      `${i18next.t(ERROR_MESSAGES.API_REQUEST_ERROR)}: ${errorMessage}`
    )
    return {
      ...updatedMessage,
      status: MESSAGE_STATUS.ERROR,
      isReasoningStreaming: false,
      errorCode: errorCode || null,
    }
  })
}

export function updateLastAssistantMessage(
  messages: Message[],
  updater: (message: Message) => Message
): Message[] {
  if (messages.length === 0) return messages
  const last = messages[messages.length - 1]
  if (!last || last.from !== MESSAGE_ROLES.ASSISTANT) return messages

  const updated = [...messages]
  updated[updated.length - 1] = updater(last)
  return updated
}

export function updateMessageByKey(
  messages: Message[],
  key: string,
  updater: (message: Message) => Message
): Message[] {
  const index = messages.findIndex((m) => m.key === key)
  if (index === -1) return messages
  const updated = [...messages]
  updated[index] = updater(messages[index])
  return updated
}

export function setMessageErrorByKey(
  messages: Message[],
  key: string,
  errorMessage: string,
  errorCode?: string
): Message[] {
  return updateMessageByKey(messages, key, (message) => ({
    ...updateCurrentVersionContent(
      message,
      `${i18next.t(ERROR_MESSAGES.API_REQUEST_ERROR)}: ${errorMessage}`
    ),
    status: MESSAGE_STATUS.ERROR,
    isReasoningStreaming: false,
    errorCode: errorCode || null,
  }))
}

/**
 * Process content chunk during streaming
 */
export function processStreamingContent(
  message: Message,
  contentChunk?: string
): Message {
  const currentVersion = getCurrentVersion(message)
  const fullContent = contentChunk
    ? currentVersion.content + contentChunk
    : currentVersion.content

  const { reasoning, hasUnclosedTag } = parseThinkTags(fullContent)

  const finalReasoning = reasoning
    ? { content: reasoning, duration: 0 }
    : message.reasoning

  return {
    ...updateCurrentVersionContent(message, fullContent),
    reasoning: finalReasoning,
    isReasoningStreaming: hasUnclosedTag,
  }
}

/**
 * Finalize message after streaming completes
 */
export function finalizeMessage(
  message: Message,
  apiReasoningContent?: string,
  options?: {
    toolCalls?: ToolCall[]
    finishReason?: string | null
    refusal?: string
    truncated?: boolean
  }
): Message {
  const currentVersion = getCurrentVersion(message)
  const { visibleContent, reasoning } = parseThinkTags(currentVersion.content)

  const finalReasoning =
    apiReasoningContent || message.reasoning?.content || reasoning || ''

  const toolCalls =
    options?.toolCalls ??
    message.toolCalls ??
    currentVersion.toolCalls

  const idx = getActiveVersionIndex(message)
  const versions = message.versions.map((v, i) =>
    i === idx
      ? {
          ...v,
          content: visibleContent,
          toolCalls: toolCalls?.length ? toolCalls : undefined,
          reasoning: finalReasoning
            ? {
                content: finalReasoning,
                duration: message.reasoning?.duration || 0,
              }
            : undefined,
          refusal: options?.refusal ?? message.refusal,
          finishReason: options?.finishReason ?? message.finishReason,
        }
      : v
  )

  return {
    ...message,
    versions,
    reasoning: finalReasoning
      ? { content: finalReasoning, duration: message.reasoning?.duration || 0 }
      : undefined,
    toolCalls: toolCalls?.length ? toolCalls : undefined,
    refusal: options?.refusal ?? message.refusal,
    finishReason: options?.finishReason ?? message.finishReason,
    isReasoningStreaming: false,
    status: options?.truncated
      ? MESSAGE_STATUS.TRUNCATED
      : message.status === MESSAGE_STATUS.ERROR
        ? MESSAGE_STATUS.ERROR
        : MESSAGE_STATUS.COMPLETE,
  }
}

/**
 * Sanitize messages loaded from storage
 */
export function sanitizeMessagesOnLoad(messages: Message[]): Message[] {
  return messages.map((m) => {
    if (
      m?.from === MESSAGE_ROLES.ASSISTANT &&
      (m?.status === MESSAGE_STATUS.LOADING ||
        m?.status === MESSAGE_STATUS.STREAMING)
    ) {
      const finalized = finalizeMessage(m, undefined, { truncated: true })
      const hasContent = getCurrentVersion(finalized).content?.trim()
      const hasReasoning = finalized.reasoning?.content?.trim()
      const hasTools = !!finalized.toolCalls?.length

      if (hasContent || hasReasoning || hasTools) {
        return {
          ...finalized,
          status: MESSAGE_STATUS.TRUNCATED,
          isReasoningStreaming: false,
        }
      }
      return {
        ...updateCurrentVersionContent(
          finalized,
          `${i18next.t(ERROR_MESSAGES.API_REQUEST_ERROR)}: ${i18next.t(ERROR_MESSAGES.INTERRUPTED)}`
        ),
        status: MESSAGE_STATUS.ERROR,
        isReasoningStreaming: false,
      }
    }
    return m
  })
}

/** Derive a short conversation title from the first user message. */
export function deriveConversationTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.from === MESSAGE_ROLES.USER)
  if (!firstUser) return 'New chat'
  const text = getCurrentVersion(firstUser).content?.trim() || ''
  if (!text) return 'New chat'
  const oneLine = text.replace(/\s+/g, ' ')
  return oneLine.length > 48 ? `${oneLine.slice(0, 48)}…` : oneLine
}
