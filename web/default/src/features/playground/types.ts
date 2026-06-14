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
// Message types
export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'loading' | 'streaming' | 'complete' | 'error'

export interface MessageVersion {
  id: string
  content: string
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  /** OpenRouter-style cached prompt tokens, when reported. */
  prompt_tokens_details?: {
    cached_tokens?: number
  }
}

export interface Message {
  key: string
  from: MessageRole
  versions: MessageVersion[]
  /**
   * Model that produced this assistant message. Set on assistant messages so
   * the side-by-side compare view can group responses per model. User messages
   * leave this undefined (they are shared across all compared models).
   */
  model?: string
  /** Image URLs attached to a user message (vision input). */
  imageUrls?: string[]
  sources?: { href: string; title: string }[]
  reasoning?: {
    content: string
    duration: number
  }
  isReasoningStreaming?: boolean
  isReasoningComplete?: boolean
  isContentComplete?: boolean
  status?: MessageStatus
  errorCode?: string | null
  /**
   * Token usage reported by the API. Available on non-streaming responses and
   * on streaming responses once `stream_options.include_usage` is requested
   * (the playground now sends it).
   */
  usage?: TokenUsage
  /** Per-response cost in USD, derived from usage × the model's pricing. */
  costUsd?: number
  /** Wall-clock latency (ms) of the request that produced this message. */
  latencyMs?: number
}

/**
 * Reasoning effort level (OpenAI/OpenRouter-style). `'off'` means do not send
 * any reasoning control upstream.
 */
export type ReasoningEffort = 'off' | 'minimal' | 'low' | 'medium' | 'high'

// API payload types
export interface ChatCompletionMessage {
  role: MessageRole
  content: string | ContentPart[]
}

export interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
  }
}

/** URL citation annotation (web search results), OpenAI/OpenRouter-style. */
export interface UrlCitationAnnotation {
  type: 'url_citation'
  url_citation: {
    url: string
    title?: string
    content?: string
    start_index?: number
    end_index?: number
  }
}

export interface StreamOptions {
  include_usage?: boolean
}

export interface WebSearchOptions {
  search_context_size?: 'low' | 'medium' | 'high'
}

export interface ChatCompletionRequest {
  model: string
  group?: string
  messages: ChatCompletionMessage[]
  stream: boolean
  stream_options?: StreamOptions
  temperature?: number
  top_p?: number
  max_tokens?: number
  frequency_penalty?: number
  presence_penalty?: number
  seed?: number
  /** OpenAI/OpenRouter reasoning effort control. Omitted when 'off'. */
  reasoning_effort?: Exclude<ReasoningEffort, 'off'>
  /** OpenRouter-style reasoning object (token budget mode). */
  reasoning?: { max_tokens?: number; effort?: Exclude<ReasoningEffort, 'off'> }
  /** Native web search controls (OpenAI/OpenRouter `web_search_options`). */
  web_search_options?: WebSearchOptions
}

export interface ChatCompletionChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: MessageRole
      content?: string
      reasoning_content?: string
      annotations?: UrlCitationAnnotation[]
    }
    finish_reason: string | null
  }>
  /** Present on the final chunk when `stream_options.include_usage` is set. */
  usage?: TokenUsage
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: MessageRole
      content: string
      reasoning_content?: string
      annotations?: UrlCitationAnnotation[]
    }
    finish_reason: string
  }>
  usage?: TokenUsage
}

// Configuration types
export interface PlaygroundConfig {
  /** Optional system prompt prepended to every request. */
  systemPrompt: string
  model: string
  /**
   * Additional models to compare against the primary `model`, side by side.
   * Empty for single-model mode. The full active set is `[model, ...compareModels]`
   * (deduplicated).
   */
  compareModels: string[]
  group: string
  temperature: number
  top_p: number
  max_tokens: number
  frequency_penalty: number
  presence_penalty: number
  seed: number | null
  stream: boolean
  /** Reasoning effort control (see ReasoningEffort). */
  reasoningEffort: ReasoningEffort
  /** When set, sends an explicit reasoning token budget instead of effort. */
  reasoningMaxTokens: number
  /** Toggle native web search for the request. */
  webSearch: boolean
}

export interface ParameterEnabled {
  temperature: boolean
  top_p: boolean
  max_tokens: boolean
  frequency_penalty: boolean
  presence_penalty: boolean
  seed: boolean
}

// Model and group options
export interface ModelOption {
  label: string
  value: string
}

export interface GroupOption {
  label: string
  value: string
  ratio: number
  desc?: string
}
