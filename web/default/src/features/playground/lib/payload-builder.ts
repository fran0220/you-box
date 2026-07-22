import type {
  ChatCompletionRequest,
  Message,
  PlaygroundConfig,
  ParameterEnabled,
} from '../types'
import { formatMessageForAPI, isValidMessage } from './message-utils'

/**
 * Resolve the active model set from config: the primary model plus any
 * compare models, deduplicated and with empties dropped. Always at least one
 * entry (the primary model) so single-model mode is the default.
 */
export function getActiveModels(config: PlaygroundConfig): string[] {
  const all = [config.model, ...(config.compareModels ?? [])]
    .map((m) => m?.trim())
    .filter((m): m is string => !!m)
  return Array.from(new Set(all))
}

/**
 * Select the conversation history for a single model. User/tool/system
 * messages are shared; assistant messages are only included when they
 * were produced by the target model (or are untagged).
 */
export function selectModelHistory(
  messages: Message[],
  targetModel: string
): Message[] {
  return messages.filter((m) => {
    if (m.from !== 'assistant') return true
    return m.model === undefined || m.model === targetModel
  })
}

interface BuildPayloadOptions {
  /** Build the request for this specific model (compare mode). */
  model: string
  /** Filter assistant history down to the target model before sending. */
  scopeHistoryToModel?: boolean
}

/**
 * Build API request payload from messages and config.
 */
export function buildChatCompletionPayload(
  messages: Message[],
  config: PlaygroundConfig,
  parameterEnabled: ParameterEnabled,
  options?: BuildPayloadOptions
): ChatCompletionRequest {
  const targetModel = options?.model ?? config.model

  const scoped =
    options?.scopeHistoryToModel && options?.model
      ? selectModelHistory(messages, options.model)
      : messages

  const processedMessages = scoped
    .filter(isValidMessage)
    .map(formatMessageForAPI)

  const systemPrompt = config.systemPrompt?.trim()
  const apiMessages = systemPrompt
    ? [{ role: 'system' as const, content: systemPrompt }, ...processedMessages]
    : processedMessages

  const payload: ChatCompletionRequest = {
    model: targetModel,
    group: config.group,
    messages: apiMessages,
    stream: config.stream,
  }

  if (config.stream) {
    payload.stream_options = { include_usage: true }
  }

  const parameterKeys: Array<keyof ParameterEnabled> = [
    'temperature',
    'top_p',
    'max_tokens',
    'frequency_penalty',
    'presence_penalty',
    'seed',
  ]

  parameterKeys.forEach((key) => {
    if (parameterEnabled[key]) {
      const value = config[key as keyof PlaygroundConfig]
      if (value !== undefined && value !== null) {
        ;(payload as unknown as Record<string, unknown>)[key] = value
      }
    }
  })

  if (config.reasoningEffort !== 'off') {
    if (config.reasoningMaxTokens && config.reasoningMaxTokens > 0) {
      payload.reasoning = { max_tokens: config.reasoningMaxTokens }
    } else {
      payload.reasoning_effort = config.reasoningEffort
      payload.reasoning = { effort: config.reasoningEffort }
    }
  }

  if (config.webSearch) {
    payload.web_search_options = {}
  }

  // Function-calling debugger: only send when tools are defined.
  const tools = (config.tools ?? []).filter((t) => t?.function?.name?.trim())
  if (tools.length > 0) {
    payload.tools = tools
    payload.tool_choice = config.toolChoice ?? 'auto'
  }

  // Structured output — omit plain text (default OpenAI behavior).
  if (config.responseFormat && config.responseFormat.type !== 'text') {
    payload.response_format = config.responseFormat
  }

  return payload
}
