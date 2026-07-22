import i18next from 'i18next'
import { useCallback, useRef, useState } from 'react'
import { SSE } from 'sse.js'
import { getCommonHeaders } from '@/lib/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants'
import {
  applyToolCallDelta,
  finalizeToolCalls,
  parseSseData,
  type ToolCallAccumulator,
} from '../lib/stream-parser'
import type {
  ChatCompletionRequest,
  TokenUsage,
  ToolCall,
  UrlCitationAnnotation,
} from '../types'

export interface StreamCallbacks {
  onUpdate: (type: 'reasoning' | 'content' | 'refusal', chunk: string) => void
  onToolCalls?: (toolCalls: ToolCall[]) => void
  onAnnotations?: (annotations: UrlCitationAnnotation[]) => void
  onComplete: (
    usage?: TokenUsage,
    meta?: { finishReason?: string | null; toolCalls?: ToolCall[] }
  ) => void
  onError: (error: string, errorCode?: string) => void
}

/**
 * Hook for handling streaming chat completion requests.
 * Supports multiple concurrent streams keyed by an opaque `streamId`.
 */
export function useStreamRequest() {
  const sourcesRef = useRef<Map<string, SSE>>(new Map())
  const completedRef = useRef<Set<string>>(new Set())
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
      const { onUpdate, onToolCalls, onAnnotations, onComplete, onError } =
        callbacks

      const source = new SSE(API_ENDPOINTS.CHAT_COMPLETIONS, {
        headers: getCommonHeaders(),
        method: 'POST',
        payload: JSON.stringify(payload),
      })

      sourcesRef.current.get(streamId)?.close()
      sourcesRef.current.set(streamId, source)
      completedRef.current.delete(streamId)
      setActiveCount(sourcesRef.current.size)

      let pendingUsage: TokenUsage | undefined
      let finishReason: string | null | undefined
      const toolAcc: ToolCallAccumulator = new Map()

      const handleError = (errorMessage: string, errorCode?: string) => {
        if (!completedRef.current.has(streamId)) {
          onError(errorMessage, errorCode)
          closeStream(streamId)
        }
      }

      source.addEventListener('message', (e: MessageEvent) => {
        const events = parseSseData(e.data)
        for (const event of events) {
          switch (event.kind) {
            case 'done': {
              completedRef.current.add(streamId)
              closeStream(streamId)
              const toolCalls = finalizeToolCalls(toolAcc)
              onComplete(pendingUsage, {
                finishReason: finishReason ?? null,
                toolCalls: toolCalls.length ? toolCalls : undefined,
              })
              return
            }
            case 'parse_error':
              // eslint-disable-next-line no-console
              console.error('Failed to parse SSE message:', event.raw)
              handleError(i18next.t(ERROR_MESSAGES.PARSE_ERROR))
              return
            case 'usage':
              pendingUsage = event.usage
              break
            case 'finish':
              finishReason = event.finishReason
              break
            case 'reasoning':
              onUpdate('reasoning', event.text)
              break
            case 'content':
              onUpdate('content', event.text)
              break
            case 'refusal':
              onUpdate('refusal', event.text)
              break
            case 'annotations':
              onAnnotations?.(event.annotations)
              break
            case 'tool_call_delta':
              applyToolCallDelta(toolAcc, event)
              onToolCalls?.(finalizeToolCalls(toolAcc))
              break
          }
        }
      })

      source.addEventListener('error', (e: Event & { data?: string }) => {
        if (source.readyState !== 2) {
          // eslint-disable-next-line no-console
          console.error('SSE Error:', e)
          let errorMessage =
            e.data || i18next.t(ERROR_MESSAGES.API_REQUEST_ERROR)
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
              // not JSON
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
            handleError(
              `HTTP ${status}: ${i18next.t(ERROR_MESSAGES.CONNECTION_CLOSED)}`
            )
          }
        }
      )

      try {
        source.stream()
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Failed to start SSE stream:', error)
        onError(i18next.t(ERROR_MESSAGES.STREAM_START_ERROR))
        closeStream(streamId)
      }
    },
    [closeStream]
  )

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
