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
 * Select the conversation history for a single model. User messages are shared
 * across all compared models; assistant messages are only included when they
 * were produced by the target model (or are untagged — legacy/single-model
 * history). This keeps each compared model's thread independent.
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
 *
 * When `options.model` is provided the payload targets that model and (if
 * `scopeHistoryToModel`) only that model's assistant turns are included.
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

  // Filter and format valid messages
  const processedMessages = scoped.filter(isValidMessage).map(formatMessageForAPI)

  // Prepend the system prompt, if set, so it applies to every model.
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

  // Request usage accounting on streaming responses so the session stats and
  // per-response cost can be derived from real token counts.
  if (config.stream) {
    payload.stream_options = { include_usage: true }
  }

  // Add enabled parameters
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

  // Reasoning control. A positive token budget takes precedence (Anthropic /
  // Gemini style); otherwise an effort level is sent (OpenAI / OpenRouter
  // style). 'off' sends nothing.
  if (config.reasoningEffort !== 'off') {
    if (config.reasoningMaxTokens && config.reasoningMaxTokens > 0) {
      payload.reasoning = { max_tokens: config.reasoningMaxTokens }
    } else {
      payload.reasoning_effort = config.reasoningEffort
      payload.reasoning = { effort: config.reasoningEffort }
    }
  }

  // Native web search.
  if (config.webSearch) {
    payload.web_search_options = {}
  }

  return payload
}
