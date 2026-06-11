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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ModelGroupSelector } from '@/components/model-group-selector'
import { getUserModels, getUserGroups } from './api'
import { PlaygroundChat } from './components/playground-chat'
import { PlaygroundInput } from './components/playground-input'
import { PlaygroundParameters } from './components/playground-parameters'
import { usePlaygroundState, useChatHandler } from './hooks'
import { createUserMessage, createLoadingAssistantMessage } from './lib'
import type { Message as MessageType } from './types'

export function Playground() {
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
  } = usePlaygroundState()

  const { sendChat, stopGeneration, isGenerating } = useChatHandler({
    config,
    parameterEnabled,
    onMessageUpdate: updateMessages,
  })

  // Edit dialog state
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(
    null
  )

  // Reset-conversation confirm + mobile parameters sheet
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [parametersSheetOpen, setParametersSheetOpen] = useState(false)

  // Load models
  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
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
        return []
      }
    },
  })

  // Load groups
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
        return []
      }
    },
  })

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

  const handleSendMessage = (text: string) => {
    const userMessage = createUserMessage(text)
    const assistantMessage = createLoadingAssistantMessage()

    const newMessages = [...messages, userMessage, assistantMessage]
    updateMessages(newMessages)

    // Send chat request
    sendChat(newMessages)
  }

  const handleRegenerateMessage = (message: MessageType) => {
    // Find the message index and regenerate from there
    const messageIndex = messages.findIndex((m) => m.key === message.key)
    if (messageIndex === -1) return

    // Remove messages after this one and regenerate
    const messagesUpToHere = messages.slice(0, messageIndex)
    const loadingMessage = createLoadingAssistantMessage()
    const newMessages = [...messagesUpToHere, loadingMessage]

    updateMessages(newMessages)
    sendChat(newMessages)
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

      const toSubmit = [
        ...updated.slice(0, index + 1),
        createLoadingAssistantMessage(),
      ]
      updateMessages(toSubmit)
      sendChat(toSubmit)
    },
    [editingMessageKey, messages, updateMessages, sendChat]
  )

  const handleDeleteMessage = (message: MessageType) => {
    const newMessages = messages.filter((m) => m.key !== message.key)
    updateMessages(newMessages)
  }

  const handleResetConfirm = () => {
    clearMessages()
    setResetConfirmOpen(false)
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
    <div className='relative flex size-full flex-col overflow-hidden'>
      {/* Header: model/group picker + meta tags + reset / mobile parameters */}
      <ModelSelectorHeader
        trigger={
          <ModelGroupSelector
            selectedModel={config.model}
            models={models}
            onModelChange={(value) => updateConfig('model', value)}
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
          <div className='mx-auto w-full max-w-4xl'>
            <PlaygroundInput
              disabled={isGenerating}
              isGenerating={isGenerating}
              onStop={stopGeneration}
              onSubmit={handleSendMessage}
            />
          </div>
        </div>

        {/* Desktop parameter rail */}
        <aside className='bg-surface hidden min-h-0 flex-col overflow-y-auto border-l lg:flex'>
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
