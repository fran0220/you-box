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
import { useCallback, useRef, useState } from 'react'
import { SSE } from 'sse.js'
import { getCommonHeaders } from '@/lib/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants'
import type {
  ChatCompletionRequest,
  ChatCompletionChunk,
  TokenUsage,
  UrlCitationAnnotation,
} from '../types'

export interface StreamCallbacks {
  onUpdate: (type: 'reasoning' | 'content', chunk: string) => void
  onAnnotations?: (annotations: UrlCitationAnnotation[]) => void
  onComplete: (usage?: TokenUsage) => void
  onError: (error: string, errorCode?: string) => void
}

/**
 * Hook for handling streaming chat completion requests.
 *
 * Supports multiple concurrent streams keyed by an opaque `streamId`, which the
 * side-by-side compare view relies on (one in-flight SSE per compared model).
 * Single-model mode simply uses one stream.
 */
export function useStreamRequest() {
  // Active SSE connections keyed by streamId.
  const sourcesRef = useRef<Map<string, SSE>>(new Map())
  // streamIds that have already completed normally (suppress late errors).
  const completedRef = useRef<Set<string>>(new Set())
  // Drives re-renders so `isStreaming` reflects reality independent of message
  // state updates.
  const [activeCount, setActiveCount] = useState(0)

  const closeStream = useCallback((streamId: string) => {
    const source = sourcesRef.current.get(streamId)
    if (source) {
      source.close()
      sourcesRef.current.delete(streamId)
      setActiveCount(sourcesRef.current.size)
    }
  }, [])

  const sendStreamRequest = useCallback(
    (
      streamId: string,
      payload: ChatCompletionRequest,
      callbacks: StreamCallbacks
    ) => {
      const { onUpdate, onAnnotations, onComplete, onError } = callbacks

      const source = new SSE(API_ENDPOINTS.CHAT_COMPLETIONS, {
        headers: getCommonHeaders(),
        method: 'POST',
        payload: JSON.stringify(payload),
      })

      // Replace any prior source under this id, then register the new one.
      sourcesRef.current.get(streamId)?.close()
      sourcesRef.current.set(streamId, source)
      completedRef.current.delete(streamId)
      setActiveCount(sourcesRef.current.size)

      // Usage may arrive on the final chunk; hold it until [DONE].
      let pendingUsage: TokenUsage | undefined

      const handleError = (errorMessage: string, errorCode?: string) => {
        if (!completedRef.current.has(streamId)) {
          onError(errorMessage, errorCode)
          closeStream(streamId)
        }
      }

      source.addEventListener('message', (e: MessageEvent) => {
        if (e.data === '[DONE]') {
          completedRef.current.add(streamId)
          closeStream(streamId)
          onComplete(pendingUsage)
          return
        }

        try {
          const chunk: ChatCompletionChunk = JSON.parse(e.data)

          // Usage-only chunk (stream_options.include_usage): no choices.
          if (chunk.usage) {
            pendingUsage = chunk.usage
          }

          const delta = chunk.choices?.[0]?.delta
          if (delta) {
            if (delta.reasoning_content) {
              onUpdate('reasoning', delta.reasoning_content)
            }
            if (delta.content) {
              onUpdate('content', delta.content)
            }
            if (delta.annotations?.length && onAnnotations) {
              onAnnotations(delta.annotations)
            }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse SSE message:', error)
          handleError(ERROR_MESSAGES.PARSE_ERROR)
        }
      })

      source.addEventListener('error', (e: Event & { data?: string }) => {
        // Only handle errors if stream didn't complete normally
        if (source.readyState !== 2) {
          // eslint-disable-next-line no-console
          console.error('SSE Error:', e)
          let errorMessage = e.data || ERROR_MESSAGES.API_REQUEST_ERROR
          let errorCode: string | undefined
          if (e.data) {
            try {
              const parsed = JSON.parse(e.data) as {
                error?: { message?: string; code?: string }
              }
              if (parsed?.error) {
                errorMessage = parsed.error.message || errorMessage
                errorCode = parsed.error.code || undefined
              }
            } catch {
              // not JSON, use raw string
            }
          }
          handleError(errorMessage, errorCode)
        }
      })

      source.addEventListener(
        'readystatechange',
        (e: Event & { readyState?: number }) => {
          const status = (source as unknown as { status?: number }).status
          if (
            e.readyState !== undefined &&
            e.readyState >= 2 &&
            status !== undefined &&
            status !== 200
          ) {
            handleError(`HTTP ${status}: ${ERROR_MESSAGES.CONNECTION_CLOSED}`)
          }
        }
      )

      try {
        source.stream()
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Failed to start SSE stream:', error)
        onError(ERROR_MESSAGES.STREAM_START_ERROR)
        closeStream(streamId)
      }
    },
    [closeStream]
  )

  // Stop one stream (id given) or all in-flight streams.
  const stopStream = useCallback((streamId?: string) => {
    if (streamId) {
      const source = sourcesRef.current.get(streamId)
      source?.close()
      sourcesRef.current.delete(streamId)
    } else {
      for (const source of sourcesRef.current.values()) {
        source.close()
      }
      sourcesRef.current.clear()
    }
    setActiveCount(sourcesRef.current.size)
  }, [])

  return {
    sendStreamRequest,
    stopStream,
    isStreaming: activeCount > 0,
  }
}
