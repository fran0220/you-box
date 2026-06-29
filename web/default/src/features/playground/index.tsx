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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import {
  ModelMetaTag,
  ModelSelectorHeader,
} from '@/components/ai-elements/model-selector-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ModelGroupSelector } from '@/components/model-group-selector'
import { getUserModels, getUserGroups, getModelPricingMap } from './api'
import { CompareModelsSelector } from './components/compare-models-selector'
import { PlaygroundChat } from './components/playground-chat'
import { PlaygroundInput } from './components/playground-input'
import { PlaygroundParameters } from './components/playground-parameters'
import { PresetsMenu } from './components/presets-menu'
import { MAX_COMPARE_MODELS } from './constants'
import { usePlaygroundState, useChatHandler, type ChatTarget } from './hooks'
import {
  createUserMessage,
  createLoadingAssistantMessage,
  getActiveModels,
} from './lib'
import type { Message as MessageType } from './types'

type PlaygroundProps = {
  initialModel?: string
}

export function Playground(props: PlaygroundProps) {
  const { t } = useTranslation()
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

  useEffect(() => {
    const model = props.initialModel?.trim()
    if (!model) return
    updateConfig('model', model)
  }, [props.initialModel, updateConfig])

  // Pricing map (model → ratios) used to derive real per-response cost.
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

  // Edit dialog state
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(
    null
  )

  // Reset-conversation confirm + mobile parameters sheet
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [parametersSheetOpen, setParametersSheetOpen] = useState(false)

  // Load models
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

  // Load groups
  const {
    data: groupsData,
    isError: groupsLoadError,
    isFetched: groupsFetched,
  } = useQuery({
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

  const modelsLoadFailed =
    modelsLoadError || (modelsFetched && (modelsData?.length ?? 0) === 0)
  const groupsLoadFailed =
    groupsLoadError || (groupsFetched && (groupsData?.length ?? 0) === 0)

  // Update models when data changes
  useEffect(() => {
    if (!modelsData) return

    setModels(modelsData)

    // Set default model if current model is not available
    const isCurrentModelValid = modelsData.some((m) => m.value === config.model)
    if (modelsData.length > 0 && !isCurrentModelValid) {
      updateConfig('model', modelsData[0].value)
    }
  }, [modelsData, config.model, setModels, updateConfig])

  // Update groups when data changes
  useEffect(() => {
    if (!groupsData) return

    setGroups(groupsData)

    const hasCurrentGroup = groupsData.some((g) => g.value === config.group)
    if (!hasCurrentGroup && groupsData.length > 0) {
      const fallback =
        groupsData.find((g) => g.value === 'default')?.value ??
        groupsData[0].value
      updateConfig('group', fallback)
    }
  }, [groupsData, setGroups, config.group, updateConfig])

  const handleSendMessage = (text: string, imageUrls?: string[]) => {
    const userMessage = createUserMessage(text, imageUrls)
    const activeModels = getActiveModels(config)

    // One loading assistant slot per active model (side-by-side compare).
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

    // Regenerate only this model's response, in place, preserving sibling
    // columns. History = everything up to and including the preceding user
    // message (the chat handler scopes it to this model).
    const model = message.model || config.model
    let userIndex = -1
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].from === 'user') {
        userIndex = i
        break
      }
    }

    const reloaded = createLoadingAssistantMessage(model)
    const newMessages = messages.map((m) =>
      m.key === message.key ? { ...reloaded, key: message.key } : m
    )
    updateMessages(newMessages)

    const history = newMessages.slice(0, userIndex + 1)
    sendChat(history, [{ key: message.key, model }])
  }

  const handleEditMessage = useCallback((message: MessageType) => {
    setEditingMessageKey(message.key)
  }, [])

  const handleEditOpenChange = useCallback((open: boolean) => {
    if (!open) setEditingMessageKey(null)
  }, [])

  // Apply edit and optionally re-submit from the edited user message
  const applyEdit = useCallback(
    (newContent: string, submit: boolean) => {
      if (!editingMessageKey) return
      const index = messages.findIndex((m) => m.key === editingMessageKey)
      if (index === -1) return

      const updated = messages.map((m) =>
        m.key === editingMessageKey
          ? { ...m, versions: [{ ...m.versions[0], content: newContent }] }
          : m
      )

      setEditingMessageKey(null)

      if (!submit || updated[index].from !== 'user') {
        updateMessages(updated)
        return
      }

      // Re-run all active models from the edited user message.
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
    clearMessages()
    setResetConfirmOpen(false)
  }

  // Switching the primary model drops it from the compare set (it is implicit).
  const handlePrimaryModelChange = (value: string) => {
    updateConfig('model', value)
    if (config.compareModels.includes(value)) {
      updateConfig(
        'compareModels',
        config.compareModels.filter((m) => m !== value)
      )
    }
  }

  const selectedGroup = useMemo(
    () => groups.find((g) => g.value === config.group),
    [groups, config.group]
  )
  const selectedModelLabel = useMemo(
    () => models.find((m) => m.value === config.model)?.label || config.model,
    [models, config.model]
  )

  const isSelectorDisabled =
    isGenerating ||
    isLoadingModels ||
    models.length === 0 ||
    groups.length === 0

  const loadFailureMessage = useMemo(() => {
    if (modelsLoadFailed && groupsLoadFailed) {
      return t(
        'Models and groups could not be loaded. Check your channel configuration and try again.'
      )
    }
    if (modelsLoadFailed) {
      return t(
        'Models could not be loaded. Check your channel configuration and try again.'
      )
    }
    return t(
      'Groups could not be loaded. Check your channel configuration and try again.'
    )
  }, [modelsLoadFailed, groupsLoadFailed, t])

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
    <div className='bg-bg text-foreground relative flex size-full flex-col overflow-hidden'>
      {(modelsLoadFailed || groupsLoadFailed) && !isLoadingModels ? (
        <Alert variant='destructive' className='mx-4 mt-3 shrink-0 sm:mx-6'>
          <AlertTitle>{t('Unable to load playground')}</AlertTitle>
          <AlertDescription>{loadFailureMessage}</AlertDescription>
        </Alert>
      ) : null}
      {/* Header: model/group picker + meta tags + reset / mobile parameters */}
      <ModelSelectorHeader
        className='bg-surface/80 border-border shrink-0 backdrop-blur-sm'
        trigger={
          <ModelGroupSelector
            selectedModel={config.model}
            models={models}
            onModelChange={handlePrimaryModelChange}
            selectedGroup={config.group}
            groups={groups}
            onGroupChange={(value) => updateConfig('group', value)}
            disabled={isSelectorDisabled}
          />
        }
        tags={
          selectedGroup && (selectedGroup.ratio || selectedGroup.desc) ? (
            <>
              {selectedGroup.ratio ? (
                <ModelMetaTag>
                  {t('Ratio: {{value}}', { value: selectedGroup.ratio })}
                </ModelMetaTag>
              ) : null}
              {selectedGroup.desc ? (
                <ModelMetaTag>{selectedGroup.desc}</ModelMetaTag>
              ) : null}
            </>
          ) : undefined
        }
        actions={
          <>
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
              className='lg:hidden'
              aria-label={t('Parameters')}
              title={t('Parameters')}
              onClick={() => setParametersSheetOpen(true)}
            >
              <SlidersHorizontal className='size-4' />
            </Button>
          </>
        }
      />

      {/* Body: conversation column + 320px parameter rail (rail collapses below lg) */}
      <div className='grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='flex min-h-0 min-w-0 flex-col overflow-hidden'>
          {/* Full-width scroll container: scrolling works even over side whitespace */}
          <div className='flex flex-1 flex-col overflow-hidden'>
            <PlaygroundChat
              messages={messages}
              modelLabel={selectedModelLabel}
              onRegenerateMessage={handleRegenerateMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              isGenerating={isGenerating}
              editingKey={editingMessageKey}
              onCancelEdit={handleEditOpenChange}
              onSaveEdit={(newContent) => applyEdit(newContent, false)}
              onSaveEditAndSubmit={(newContent) => applyEdit(newContent, true)}
            />
          </div>

          {/* Input area: center content and constrain to the same container width */}
          <div className='border-border bg-bg mx-auto w-full max-w-4xl border-t px-4 py-3 sm:px-6'>
            <PlaygroundInput
              disabled={isGenerating}
              isGenerating={isGenerating}
              onStop={stopGeneration}
              onSubmit={handleSendMessage}
              webSearch={config.webSearch}
              onWebSearchChange={(value) => updateConfig('webSearch', value)}
            />
          </div>
        </div>

        {/* Desktop parameter rail */}
        <aside className='bg-surface-inset border-border hidden min-h-0 flex-col overflow-y-auto border-l lg:flex'>
          {parametersPanel}
        </aside>
      </div>

      {/* Mobile (<lg) parameter sheet — same panel component as the rail */}
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

      {/* Reset conversation confirm */}
      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        destructive
        title={t('Reset conversation')}
        desc={t(
          'This will clear all messages in the current session. This action cannot be undone.'
        )}
        confirmText={t('Reset')}
        handleConfirm={handleResetConfirm}
      />
    </div>
  )
}
