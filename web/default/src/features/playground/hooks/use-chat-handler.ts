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
import { toast } from 'sonner'
import { sendChatCompletion } from '../api'
import { MESSAGE_STATUS, ERROR_MESSAGES } from '../constants'
import {
  buildChatCompletionPayload,
  setMessageErrorByKey,
  updateMessageByKey,
  processStreamingContent,
  finalizeMessage,
  computeCostUsd,
  type ModelPricing,
} from '../lib'
import type {
  Message,
  PlaygroundConfig,
  ParameterEnabled,
  TokenUsage,
  UrlCitationAnnotation,
} from '../types'
import { useStreamRequest } from './use-stream-request'

/** An assistant slot to fill: its message key and the model that produces it. */
export interface ChatTarget {
  key: string
  model: string
}

interface UseChatHandlerOptions {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  onMessageUpdate: (updater: (prev: Message[]) => Message[]) => void
  /** model name → pricing, used to derive per-response cost. */
  pricingMap?: Record<string, ModelPricing>
  /** Ratio of the active group, multiplied into the cost. */
  groupRatio?: number
}

/** Merge new url citations into an assistant message's sources (dedup by href). */
function mergeSources(
  message: Message,
  annotations: UrlCitationAnnotation[]
): Message['sources'] {
  const existing = message.sources ?? []
  const seen = new Set(existing.map((s) => s.href))
  const additions = annotations
    .filter((a) => a.type === 'url_citation' && a.url_citation?.url)
    .map((a) => ({
      href: a.url_citation.url,
      title: a.url_citation.title || a.url_citation.url,
    }))
    .filter((s) => {
      if (seen.has(s.href)) return false
      seen.add(s.href)
      return true
    })
  return additions.length ? [...existing, ...additions] : existing
}

/**
 * Hook for handling chat message sending and receiving. Drives one or many
 * concurrent model responses (side-by-side compare), routing each stream to
 * its own assistant message by key.
 */
export function useChatHandler({
  config,
  parameterEnabled,
  onMessageUpdate,
  pricingMap,
  groupRatio = 1,
}: UseChatHandlerOptions) {
  const { sendStreamRequest, stopStream, isStreaming } = useStreamRequest()

  // Wall-clock start per in-flight target (keyed by assistant message key).
  const requestStartRef = useRef<Map<string, number>>(new Map())
  // Count of in-flight non-streaming requests (the stream manager only tracks
  // SSE connections), so `isGenerating` is correct in non-streaming mode too.
  const [pendingCount, setPendingCount] = useState(0)

  const costFor = useCallback(
    (model: string, usage: TokenUsage | undefined): number | undefined =>
      computeCostUsd(usage, pricingMap?.[model], groupRatio),
    [pricingMap, groupRatio]
  )

  // ---- streaming -----------------------------------------------------------

  const sendStreamingTo = useCallback(
    (messages: Message[], target: ChatTarget) => {
      const payload = buildChatCompletionPayload(
        messages,
        config,
        parameterEnabled,
        {
          model: target.model,
          scopeHistoryToModel: true,
        }
      )
      requestStartRef.current.set(target.key, Date.now())

      sendStreamRequest(target.key, payload, {
        onUpdate: (type, chunk) => {
          onMessageUpdate((prev) =>
            updateMessageByKey(prev, target.key, (message) => {
              if (message.status === MESSAGE_STATUS.ERROR) return message
              if (type === 'reasoning') {
                return {
                  ...message,
                  reasoning: {
                    content: (message.reasoning?.content || '') + chunk,
                    duration: 0,
                  },
                  isReasoningStreaming: true,
                  status: MESSAGE_STATUS.STREAMING,
                }
              }
              return {
                ...processStreamingContent(message, chunk),
                status: MESSAGE_STATUS.STREAMING,
              }
            })
          )
        },
        onAnnotations: (annotations) => {
          onMessageUpdate((prev) =>
            updateMessageByKey(prev, target.key, (message) => ({
              ...message,
              sources: mergeSources(message, annotations),
            }))
          )
        },
        onComplete: (usage) => {
          const startedAt = requestStartRef.current.get(target.key)
          const latencyMs =
            startedAt != null ? Date.now() - startedAt : undefined
          requestStartRef.current.delete(target.key)
          onMessageUpdate((prev) =>
            updateMessageByKey(prev, target.key, (message) =>
              message.status === MESSAGE_STATUS.COMPLETE ||
              message.status === MESSAGE_STATUS.ERROR
                ? message
                : {
                    ...finalizeMessage(message),
                    status: MESSAGE_STATUS.COMPLETE,
                    usage,
                    costUsd: costFor(target.model, usage),
                    latencyMs,
                  }
            )
          )
        },
        onError: (error, errorCode) => {
          requestStartRef.current.delete(target.key)
          toast.error(error)
          onMessageUpdate((prev) =>
            setMessageErrorByKey(prev, target.key, error, errorCode)
          )
        },
      })
    },
    [config, parameterEnabled, sendStreamRequest, onMessageUpdate, costFor]
  )

  // ---- non-streaming -------------------------------------------------------

  const sendNonStreamingTo = useCallback(
    async (messages: Message[], target: ChatTarget) => {
      const payload = buildChatCompletionPayload(
        messages,
        config,
        parameterEnabled,
        {
          model: target.model,
          scopeHistoryToModel: true,
        }
      )
      const startedAt = Date.now()
      setPendingCount((c) => c + 1)
      try {
        const response = await sendChatCompletion(payload)
        const latencyMs = Date.now() - startedAt
        const choice = response.choices?.[0]
        if (!choice) return

        const annotations = choice.message?.annotations
        onMessageUpdate((prev) =>
          updateMessageByKey(prev, target.key, (message) => {
            const withContent: Message = {
              ...message,
              versions: [
                {
                  ...message.versions[0],
                  content: choice.message?.content || '',
                },
              ],
            }
            return {
              ...finalizeMessage(
                withContent,
                choice.message?.reasoning_content
              ),
              status: MESSAGE_STATUS.COMPLETE,
              usage: response.usage,
              costUsd: costFor(target.model, response.usage),
              latencyMs,
              sources: annotations?.length
                ? mergeSources(message, annotations)
                : message.sources,
            }
          })
        )
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string; error?: { code?: string } } }
          message?: string
        }
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          ERROR_MESSAGES.API_REQUEST_ERROR
        toast.error(errorMessage)
        onMessageUpdate((prev) =>
          setMessageErrorByKey(
            prev,
            target.key,
            errorMessage,
            err?.response?.data?.error?.code || undefined
          )
        )
      } finally {
        setPendingCount((c) => Math.max(0, c - 1))
      }
    },
    [config, parameterEnabled, onMessageUpdate, costFor]
  )

  // ---- public api ----------------------------------------------------------

  /**
   * Send the conversation to one or more model targets. Each target streams
   * (or resolves) into its own assistant message by key.
   */
  const sendChat = useCallback(
    (messages: Message[], targets: ChatTarget[]) => {
      for (const target of targets) {
        if (config.stream) {
          sendStreamingTo(messages, target)
        } else {
          void sendNonStreamingTo(messages, target)
        }
      }
    },
    [config.stream, sendStreamingTo, sendNonStreamingTo]
  )

  // Stop all in-flight generations and finalize any still-pending messages.
  const stopGeneration = useCallback(() => {
    stopStream()
    requestStartRef.current.clear()
    setPendingCount(0)
    onMessageUpdate((prev) =>
      prev.map((message) =>
        message.from === 'assistant' &&
        (message.status === MESSAGE_STATUS.LOADING ||
          message.status === MESSAGE_STATUS.STREAMING)
          ? { ...finalizeMessage(message), status: MESSAGE_STATUS.COMPLETE }
          : message
      )
    )
  }, [stopStream, onMessageUpdate])

  return {
    sendChat,
    stopGeneration,
    isGenerating: isStreaming || pendingCount > 0,
  }
}
