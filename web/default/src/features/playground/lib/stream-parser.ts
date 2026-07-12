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
  ChatCompletionChunk,
  TokenUsage,
  ToolCall,
  UrlCitationAnnotation,
} from '../types'

/** Accumulator for streaming tool_calls deltas (keyed by choice index). */
export type ToolCallAccumulator = Map<
  number,
  {
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }
>

export type ParsedStreamEvent =
  | { kind: 'done' }
  | { kind: 'content'; text: string }
  | { kind: 'reasoning'; text: string }
  | { kind: 'refusal'; text: string }
  | { kind: 'annotations'; annotations: UrlCitationAnnotation[] }
  | { kind: 'usage'; usage: TokenUsage }
  | { kind: 'finish'; finishReason: string | null }
  | {
      kind: 'tool_call_delta'
      index: number
      id?: string
      name?: string
      arguments?: string
    }
  | { kind: 'parse_error'; raw: string }

/**
 * Parse a single SSE data payload (not including the `data: ` prefix).
 * Returns one or more events extracted from the chunk.
 */
export function parseSseData(
  data: string
): ParsedStreamEvent[] {
  if (data === '[DONE]') {
    return [{ kind: 'done' }]
  }

  let chunk: ChatCompletionChunk
  try {
    chunk = JSON.parse(data) as ChatCompletionChunk
  } catch {
    return [{ kind: 'parse_error', raw: data }]
  }

  const events: ParsedStreamEvent[] = []

  if (chunk.usage) {
    events.push({ kind: 'usage', usage: chunk.usage })
  }

  // Only process the first choice (compare mode uses separate requests).
  const choice = chunk.choices?.[0]
  if (!choice) {
    return events
  }

  if (choice.finish_reason != null) {
    events.push({ kind: 'finish', finishReason: choice.finish_reason })
  }

  const delta = choice.delta
  if (!delta) {
    return events
  }

  if (delta.reasoning_content) {
    events.push({ kind: 'reasoning', text: delta.reasoning_content })
  }
  if (delta.content) {
    events.push({ kind: 'content', text: delta.content })
  }
  if (delta.refusal) {
    events.push({ kind: 'refusal', text: delta.refusal })
  }
  if (delta.annotations?.length) {
    events.push({ kind: 'annotations', annotations: delta.annotations })
  }
  if (delta.tool_calls?.length) {
    for (const tc of delta.tool_calls) {
      events.push({
        kind: 'tool_call_delta',
        index: tc.index ?? 0,
        id: tc.id,
        name: tc.function?.name,
        arguments: tc.function?.arguments,
      })
    }
  }

  return events
}

/** Merge a tool_call delta into the accumulator map. */
export function applyToolCallDelta(
  acc: ToolCallAccumulator,
  event: Extract<ParsedStreamEvent, { kind: 'tool_call_delta' }>
): void {
  const existing = acc.get(event.index)
  if (!existing) {
    acc.set(event.index, {
      id: event.id || `call_${event.index}`,
      type: 'function',
      function: {
        name: event.name || '',
        arguments: event.arguments || '',
      },
    })
    return
  }
  if (event.id) existing.id = event.id
  if (event.name) {
    existing.function.name = (existing.function.name || '') + event.name
  }
  if (event.arguments) {
    existing.function.arguments =
      (existing.function.arguments || '') + event.arguments
  }
}

/** Snapshot accumulator into a stable ToolCall[] ordered by index. */
export function finalizeToolCalls(acc: ToolCallAccumulator): ToolCall[] {
  return Array.from(acc.entries())
    .sort(([a], [b]) => a - b)
    .map(([, tc]) => ({
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }))
}
