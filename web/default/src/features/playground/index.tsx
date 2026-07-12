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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import i18next from 'i18next'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ModelSelectorHeader } from '@/components/ai-elements/model-selector-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ModelSelector } from '@/components/model-group-selector'
import {
  createConversation,
  getConversation,
  getUserModels,
  getUserGroups,
  getModelPricingMap,
  updateConversation,
} from './api'
import { CompareModelsSelector } from './components/compare-models-selector'
import { ConversationRail } from './components/conversation-rail'
import { ExportMenu } from './components/export-menu'
import { PlaygroundChat } from './components/playground-chat'
import { PlaygroundInput } from './components/playground-input'
import { PlaygroundParameters } from './components/playground-parameters'
import { PresetsMenu } from './components/presets-menu'
import { MAX_COMPARE_MODELS } from './constants'
import { usePlaygroundState, useChatHandler, type ChatTarget } from './hooks'
import {
  createUserMessage,
  createLoadingAssistantMessage,
  createToolResultMessage,
  deriveConversationTitle,
  getActiveModels,
  loadActiveConversationId,
  pushAssistantVersion,
  saveActiveConversationId,
} from './lib'
import {
  filterChatModels,
  pickGroupForModel,
  supportsReasoning,
} from './lib/model-capabilities'
import type {
  Message as MessageType,
  ParameterEnabled,
  PlaygroundConfig,
  ReasoningEffort,
} from './types'

type PlaygroundProps = {
  initialModel?: string
}

export function Playground(props: PlaygroundProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const {
    config,
    parameterEnabled,
    messages,
    models,
    groups,
    updateMessages,
    setModels,
    setGroups,
    updateConfig,
    updateParameterEnabled,
    clearMessages,
    applyPreset,
  } = usePlaygroundState()

  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(() => loadActiveConversationId())
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextPersistRef = useRef(false)

  useEffect(() => {
    const model = props.initialModel?.trim()
    if (!model) return
    updateConfig('model', model)
  }, [props.initialModel, updateConfig])

  const { data: pricingMap } = useQuery({
    queryKey: ['playground-pricing'],
    queryFn: async () => {
      try {
        return await getModelPricingMap()
      } catch {
        return {}
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const groupRatio = useMemo(
    () => groups.find((g) => g.value === config.group)?.ratio ?? 1,
    [groups, config.group]
  )

  const { sendChat, stopGeneration, isGenerating } = useChatHandler({
    config,
    parameterEnabled,
    onMessageUpdate: updateMessages,
    pricingMap,
    groupRatio,
  })

  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(
    null
  )
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [parametersSheetOpen, setParametersSheetOpen] = useState(false)

  // Debounced cloud persistence of the active conversation.
  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }
    if (isGenerating) return
    if (messages.length === 0 && activeConversationId == null) return

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const title = deriveConversationTitle(messages)
          const messagesJson = JSON.stringify(messages)
          const configJson = JSON.stringify({ config, parameterEnabled })
          if (activeConversationId == null) {
            if (messages.length === 0) return
            const created = await createConversation({
              title,
              messages: messagesJson,
              config: configJson,
            })
            setActiveConversationId(created.id)
            saveActiveConversationId(created.id)
          } else {
            await updateConversation(activeConversationId, {
              title,
              messages: messagesJson,
              config: configJson,
            })
          }
          void queryClient.invalidateQueries({
            queryKey: ['playground-conversations'],
          })
        } catch {
          // Cloud save is best-effort; localStorage already holds a draft.
        }
      })()
    }, 800)

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    }
  }, [
    messages,
    config,
    parameterEnabled,
    activeConversationId,
    isGenerating,
    queryClient,
  ])

  const handleSelectConversation = useCallback(
    async (id: number) => {
      try {
        const conv = await getConversation(id)
        if (!conv) {
          toast.error(t('Conversation not found'))
          return
        }
        skipNextPersistRef.current = true
        let parsedMessages: MessageType[] = []
        try {
          parsedMessages = JSON.parse(conv.messages || '[]') as MessageType[]
          if (!Array.isArray(parsedMessages)) parsedMessages = []
        } catch {
          parsedMessages = []
        }
        updateMessages(parsedMessages)
        if (conv.config) {
          try {
            const payload = JSON.parse(conv.config) as {
              config?: Partial<PlaygroundConfig>
              parameterEnabled?: ParameterEnabled
            }
            if (payload.config) {
              applyPreset(payload.config, payload.parameterEnabled)
            }
          } catch {
            // ignore bad config snapshot
          }
        }
        setActiveConversationId(id)
        saveActiveConversationId(id)
      } catch {
        toast.error(t('Failed to load conversation'))
      }
    },
    [applyPreset, t, updateMessages]
  )

  const handleNewConversation = useCallback(() => {
    skipNextPersistRef.current = true
    clearMessages()
    setActiveConversationId(null)
    saveActiveConversationId(null)
  }, [clearMessages])

  const {
    data: modelsData,
    isLoading: isLoadingModels,
    isError: modelsLoadError,
    isFetched: modelsFetched,
  } = useQuery({
    queryKey: ['playground-models'],
    queryFn: async () => {
      try {
        return await getUserModels()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : i18next.t('Failed to load playground models')
        )
        throw error
      }
    },
    retry: 1,
  })

  const { data: groupsData } = useQuery({
    queryKey: ['playground-groups'],
    queryFn: async () => {
      try {
        return await getUserGroups()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : i18next.t('Failed to load playground groups')
        )
        throw error
      }
    },
    retry: 1,
  })

  const chatModels = useMemo(
    () => filterChatModels(modelsData ?? [], pricingMap),
    [modelsData, pricingMap]
  )

  const modelsLoadFailed = modelsLoadError
  const noChatModels =
    modelsFetched &&
    !modelsLoadError &&
    chatModels.length === 0 &&
    (modelsData?.length ?? 0) > 0

  const modelSupportsReasoning = useMemo(
    () => supportsReasoning(config.model, pricingMap?.[config.model]),
    [config.model, pricingMap]
  )

  useEffect(() => {
    setModels(chatModels)
    const isCurrentModelValid = chatModels.some((m) => m.value === config.model)
    if (chatModels.length > 0 && !isCurrentModelValid) {
      updateConfig('model', chatModels[0].value)
    }
  }, [chatModels, config.model, setModels, updateConfig])

  useEffect(() => {
    if (!groupsData) return
    setGroups(groupsData)
  }, [groupsData, setGroups])

  // Silent group reconciliation: no UI, but keep payload group valid for the model.
  useEffect(() => {
    if (!groupsData || groupsData.length === 0) return
    const enableGroups = pricingMap?.[config.model]?.enableGroups
    const next = pickGroupForModel(config.group, enableGroups, groupsData)
    if (next !== config.group) {
      updateConfig('group', next)
    }
  }, [config.model, config.group, groupsData, pricingMap, updateConfig])

  // Force reasoning off when switching to a non-reasoning model (incl. restore).
  useEffect(() => {
    if (!modelSupportsReasoning && config.reasoningEffort !== 'off') {
      updateConfig('reasoningEffort', 'off')
    }
  }, [modelSupportsReasoning, config.reasoningEffort, updateConfig])

  const handleSendMessage = (text: string, imageUrls?: string[]) => {
    const userMessage = createUserMessage(text, imageUrls)
    const activeModels = getActiveModels(config)
    const assistantMessages = activeModels.map((model) =>
      createLoadingAssistantMessage(model)
    )
    const targets: ChatTarget[] = assistantMessages.map((m, i) => ({
      key: m.key,
      model: activeModels[i],
    }))
    const newMessages = [...messages, userMessage, ...assistantMessages]
    updateMessages(newMessages)
    sendChat(newMessages, targets)
  }

  const handleRegenerateMessage = (message: MessageType) => {
    const messageIndex = messages.findIndex((m) => m.key === message.key)
    if (messageIndex === -1) return

    const model = message.model || config.model
    let userIndex = -1
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].from === 'user') {
        userIndex = i
        break
      }
    }

    // Push a new version branch instead of overwriting.
    const branched = pushAssistantVersion(message)
    const newMessages = messages.map((m) =>
      m.key === message.key ? branched : m
    )
    updateMessages(newMessages)

    const history = newMessages.slice(0, userIndex + 1)
    sendChat(history, [{ key: message.key, model }])
  }

  const handleSubmitToolResults = useCallback(
    (
      assistantMessage: MessageType,
      results: Array<{
        toolCallId: string
        toolName: string
        result: string
      }>
    ) => {
      const toolMessages = results.map((r) =>
        createToolResultMessage(r.toolCallId, r.toolName, r.result)
      )
      const activeModels = getActiveModels(config)
      // Continue only for the model that issued the tool calls (or primary).
      const model = assistantMessage.model || config.model
      const loading = createLoadingAssistantMessage(model)
      const base = [...messages, ...toolMessages, loading]
      updateMessages(base)
      sendChat(base, [{ key: loading.key, model }])
      void activeModels
    },
    [config, messages, sendChat, updateMessages]
  )

  const handleActiveVersionChange = useCallback(
    (messageKey: string, index: number) => {
      updateMessages((prev) =>
        prev.map((m) =>
          m.key === messageKey ? { ...m, activeVersionIndex: index } : m
        )
      )
    },
    [updateMessages]
  )

  const handleEditMessage = useCallback((message: MessageType) => {
    setEditingMessageKey(message.key)
  }, [])

  const handleEditOpenChange = useCallback((open: boolean) => {
    if (!open) setEditingMessageKey(null)
  }, [])

  const applyEdit = useCallback(
    (newContent: string, submit: boolean) => {
      if (!editingMessageKey) return
      const index = messages.findIndex((m) => m.key === editingMessageKey)
      if (index === -1) return

      const updated = messages.map((m) =>
        m.key === editingMessageKey
          ? {
              ...m,
              versions: m.versions.map((v, i) =>
                i === (m.activeVersionIndex ?? m.versions.length - 1)
                  ? { ...v, content: newContent }
                  : v
              ),
            }
          : m
      )

      setEditingMessageKey(null)

      if (!submit || updated[index].from !== 'user') {
        updateMessages(updated)
        return
      }

      const activeModels = getActiveModels(config)
      const assistantMessages = activeModels.map((model) =>
        createLoadingAssistantMessage(model)
      )
      const targets: ChatTarget[] = assistantMessages.map((m, i) => ({
        key: m.key,
        model: activeModels[i],
      }))

      const toSubmit = [...updated.slice(0, index + 1), ...assistantMessages]
      updateMessages(toSubmit)
      sendChat(toSubmit, targets)
    },
    [editingMessageKey, messages, updateMessages, sendChat, config]
  )

  const handleDeleteMessage = (message: MessageType) => {
    const newMessages = messages.filter((m) => m.key !== message.key)
    updateMessages(newMessages)
  }

  const handleResetConfirm = () => {
    handleNewConversation()
    setResetConfirmOpen(false)
  }

  const handlePrimaryModelChange = (value: string) => {
    updateConfig('model', value)
    if (config.compareModels.includes(value)) {
      updateConfig(
        'compareModels',
        config.compareModels.filter((m) => m !== value)
      )
    }
  }

  const selectedModelLabel = useMemo(
    () => models.find((m) => m.value === config.model)?.label || config.model,
    [models, config.model]
  )

  const isSelectorDisabled =
    isGenerating || isLoadingModels || models.length === 0

  const loadFailureMessage = useMemo(() => {
    if (modelsLoadFailed) {
      return t(
        'Chat models could not be loaded. Check your account models and try again.'
      )
    }
    if (noChatModels) {
      return t(
        'No chat-capable models are available. Audio and specialty models are hidden from Chat.'
      )
    }
    return t('Unable to load chat.')
  }, [modelsLoadFailed, noChatModels, t])

  const parametersPanel = (
    <PlaygroundParameters
      config={config}
      parameterEnabled={parameterEnabled}
      onConfigChange={updateConfig}
      onParameterEnabledChange={updateParameterEnabled}
      messages={messages}
    />
  )

  return (
    <div className='bg-bg text-foreground relative flex size-full overflow-hidden'>
      <div className='hidden h-full lg:block'>
        <ConversationRail
          activeId={activeConversationId}
          onSelect={(id) => void handleSelectConversation(id)}
          onNew={handleNewConversation}
          disabled={isGenerating}
        />
      </div>

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {(modelsLoadFailed || noChatModels) && !isLoadingModels ? (
          <Alert variant='destructive' className='mx-4 mt-3 shrink-0 sm:mx-6'>
            <AlertTitle>{t('Unable to load chat')}</AlertTitle>
            <AlertDescription>{loadFailureMessage}</AlertDescription>
          </Alert>
        ) : null}

        <ModelSelectorHeader
          className='bg-surface/80 border-border shrink-0 backdrop-blur-sm'
          trigger={
            <ModelSelector
              selectedModel={config.model}
              models={models}
              onModelChange={handlePrimaryModelChange}
              disabled={isSelectorDisabled}
              className='min-w-0 sm:min-w-[12rem]'
            />
          }
          actions={
            <>
              <ExportMenu
                messages={messages}
                config={config}
                parameterEnabled={parameterEnabled}
                disabled={isGenerating}
              />
              <PresetsMenu
                config={config}
                parameterEnabled={parameterEnabled}
                onApply={applyPreset}
                disabled={isLoadingModels}
              />
              <CompareModelsSelector
                models={models}
                primaryModel={config.model}
                value={config.compareModels}
                onChange={(next) => updateConfig('compareModels', next)}
                max={MAX_COMPARE_MODELS}
                disabled={isSelectorDisabled}
              />
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label={t('Reset conversation')}
                title={t('Reset conversation')}
                disabled={isGenerating || messages.length === 0}
                onClick={() => setResetConfirmOpen(true)}
              >
                <RotateCcw className='size-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label={t('Parameters')}
                title={t('Parameters')}
                onClick={() => setParametersSheetOpen(true)}
              >
                <SlidersHorizontal className='size-4' />
              </Button>
            </>
          }
        />

        <div className='grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)]'>
          <div className='flex min-h-0 min-w-0 flex-col overflow-hidden'>
            <div className='flex flex-1 flex-col overflow-hidden'>
              <PlaygroundChat
                messages={messages}
                modelLabel={selectedModelLabel}
                onRegenerateMessage={handleRegenerateMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onSubmitToolResults={handleSubmitToolResults}
                onActiveVersionChange={handleActiveVersionChange}
                isGenerating={isGenerating}
                editingKey={editingMessageKey}
                onCancelEdit={handleEditOpenChange}
                onSaveEdit={(newContent) => applyEdit(newContent, false)}
                onSaveEditAndSubmit={(newContent) => applyEdit(newContent, true)}
              />
            </div>

            <div className='border-border bg-bg mx-auto w-full max-w-4xl border-t px-4 py-3 sm:px-6'>
              <PlaygroundInput
                disabled={isGenerating || models.length === 0}
                isGenerating={isGenerating}
                onStop={stopGeneration}
                onSubmit={handleSendMessage}
                webSearch={config.webSearch}
                onWebSearchChange={(value) => updateConfig('webSearch', value)}
                showReasoningEffort={modelSupportsReasoning}
                reasoningEffort={config.reasoningEffort}
                onReasoningEffortChange={(value: ReasoningEffort) =>
                  updateConfig('reasoningEffort', value)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Sheet open={parametersSheetOpen} onOpenChange={setParametersSheetOpen}>
        <SheetContent side='right' className='gap-0'>
          <SheetHeader className='border-b'>
            <SheetTitle>{t('Parameters')}</SheetTitle>
            <SheetDescription className='sr-only'>
              {t('Tune model parameters for this session')}
            </SheetDescription>
          </SheetHeader>
          <div className='min-h-0 flex-1 overflow-y-auto'>
            {parametersPanel}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        destructive
        title={t('Reset conversation')}
        desc={t(
          'This will clear the current thread and start a new chat. Saved conversations are kept in the history rail.'
        )}
        confirmText={t('Reset')}
        handleConfirm={handleResetConfirm}
      />
    </div>
  )
}
