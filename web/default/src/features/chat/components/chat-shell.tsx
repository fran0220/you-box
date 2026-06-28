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
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { formatQuota } from '@/lib/format'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConversationRailItem } from '@/components/ai-elements/conversation-rail-item'
import { FilterBarSearch } from '@/components/data-table'
import { Eyebrow } from '@/components/youbox'
import { fetchActiveChatKey } from '../hooks/use-active-chat-key'
import { useChatPresets } from '../hooks/use-chat-presets'
import {
  chatLinkRequiresApiKey,
  resolveChatUrl,
  type ChatPreset,
} from '../lib/chat-links'

type ChatShellProps = {
  /** Route param of the currently open preset (matched against preset.id). */
  activeChatId: string
  /** Resolved preset for the current route; undefined when not found. */
  preset?: ChatPreset
  /** Resolved iframe URL for web presets (empty until the key is ready). */
  resolvedUrl?: string
  /** Content area: iframe or one of the state components. */
  children: ReactNode
}

function getUrlHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * ChatShell (R2-B5) — page shell for /chat/$chatId: left preset rail
 * (eyebrow + search + ConversationRailItem list + user card) and a top
 * bar (preset name + type badge + open-in-new-window). The message area
 * itself is an external preset iframe rendered by the caller.
 */
export function ChatShell({
  activeChatId,
  preset,
  resolvedUrl,
  children,
}: ChatShellProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { chatPresets, serverAddress } = useChatPresets()
  const user = useAuthStore((state) => state.auth.user)
  const [search, setSearch] = useState('')
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null)
  const loadingPresetIdRef = useRef<string | null>(null)

  // Mirror the global sidebar: fluent presets are launched from API key
  // actions (sendToFluent), not from chat navigation surfaces.
  const visiblePresets = useMemo(
    () => chatPresets.filter((item) => item.type !== 'fluent'),
    [chatPresets]
  )

  const filteredPresets = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return visiblePresets
    return visiblePresets.filter((item) =>
      item.name.toLowerCase().includes(query)
    )
  }, [search, visiblePresets])

  // Same semantics as the sidebar ChatPresetsItem: resolve the api key on
  // demand, then open the external client without navigating.
  const handleOpenExternal = useCallback(
    async (target: ChatPreset) => {
      if (target.type === 'web') return

      const needsKey = chatLinkRequiresApiKey(target.url)
      let activeKey: string | undefined

      if (needsKey && loadingPresetIdRef.current) {
        toast.info(t('Preparing your chat link, please try again in a moment.'))
        return
      }

      if (needsKey) {
        loadingPresetIdRef.current = target.id
        setLoadingPresetId(target.id)
        try {
          activeKey = await fetchActiveChatKey()
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t(
                  'Unable to prepare chat link. Please ensure you have an enabled API key.'
                )
          toast.error(message)
          return
        } finally {
          loadingPresetIdRef.current = null
          setLoadingPresetId(null)
        }
      }

      const url = resolveChatUrl({
        template: target.url,
        apiKey: needsKey ? activeKey : undefined,
        serverAddress,
      })

      if (!url) {
        toast.error(t('Invalid chat link. Please contact the administrator.'))
        return
      }

      if (typeof window === 'undefined') return
      window.open(url, '_blank', 'noopener')
    },
    [serverAddress, t]
  )

  const handlePresetClick = useCallback(
    (target: ChatPreset) => {
      if (target.type === 'web') {
        void navigate({ to: '/chat/$chatId', params: { chatId: target.id } })
        return
      }
      void handleOpenExternal(target)
    },
    [handleOpenExternal, navigate]
  )

  const handleOpenInNewWindow = useCallback(() => {
    if (!preset) return
    if (preset.type === 'web') {
      if (!resolvedUrl || typeof window === 'undefined') return
      window.open(resolvedUrl, '_blank', 'noopener')
      return
    }
    void handleOpenExternal(preset)
  }, [handleOpenExternal, preset, resolvedUrl])

  const displayName = user?.display_name || user?.username || ''
  const initials = displayName.slice(0, 2).toUpperCase()
  const openDisabled = preset?.type === 'web' && !resolvedUrl
  const openLoading = preset != null && loadingPresetId === preset.id

  return (
    <div className='bg-background flex h-full min-h-0'>
      <aside className='bg-surface-inset border-border hidden w-[268px] shrink-0 flex-col border-r lg:flex'>
        <div className='border-border space-y-3 border-b px-4 py-4'>
          <Eyebrow>{t('Presets')}</Eyebrow>
          <FilterBarSearch
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('Search presets')}
            aria-label={t('Search presets')}
            containerClassName='max-w-none sm:max-w-none'
          />
        </div>
        <nav
          aria-label={t('Chat Presets')}
          className='min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2'
        >
          {filteredPresets.length === 0 ? (
            <p className='text-muted-foreground px-3 py-2 font-mono text-xs'>
              {t('No matching presets')}
            </p>
          ) : (
            filteredPresets.map((item) => (
              <ConversationRailItem
                key={item.id}
                title={item.name}
                sub={
                  item.type === 'web' ? (
                    getUrlHostname(item.url)
                  ) : (
                    <span className='inline-flex items-center gap-1'>
                      {loadingPresetId === item.id ? (
                        <Loader2
                          aria-hidden='true'
                          className='size-3 animate-spin'
                        />
                      ) : (
                        <ExternalLink aria-hidden='true' className='size-3' />
                      )}
                      {t('Opens externally')}
                    </span>
                  )
                }
                active={item.id === activeChatId}
                onClick={() => handlePresetClick(item)}
              />
            ))
          )}
        </nav>
        <div className='border-border flex items-center gap-3 border-t px-4 py-3'>
          <Avatar size='sm'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-[13px] font-semibold text-foreground'>
              {displayName}
            </div>
          </div>
          <span className='text-muted-foreground shrink-0 font-mono text-[11px]'>
            {formatQuota(user?.quota ?? 0)}
          </span>
        </div>
      </aside>
      <div className='bg-background flex min-w-0 flex-1 flex-col'>
        <div className='border-border flex h-[60px] shrink-0 items-center gap-3 border-b px-6'>
          <h1 className='text-foreground min-w-0 flex-1 truncate text-[15px] font-semibold'>
            {preset?.name ?? t('Chat')}
          </h1>
          {preset != null && (
            <Badge variant='secondary'>
              {preset.type === 'web' ? t('Embedded') : t('External')}
            </Badge>
          )}
          {preset != null && (
            <Button
              variant='ghost'
              size='icon'
              className='ms-auto'
              disabled={openDisabled || openLoading}
              onClick={handleOpenInNewWindow}
              aria-label={t('Open in new tab')}
              title={t('Open in new tab')}
            >
              {openLoading ? (
                <Loader2 className='animate-spin' />
              ) : (
                <ExternalLink />
              )}
            </Button>
          )}
        </div>
        <div className='min-h-0 flex-1'>{children}</div>
      </div>
    </div>
  )
}
