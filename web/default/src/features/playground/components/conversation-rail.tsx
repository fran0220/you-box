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
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConversationRailItem } from '@/components/ai-elements/conversation-rail-item'
import { FilterBarSearch } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/youbox'
import {
  deleteConversation,
  listConversations,
} from '../api'
import type { ConversationListItem } from '../types'

interface ConversationRailProps {
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  disabled?: boolean
}

export function ConversationRail({
  activeId,
  onSelect,
  onNew,
  disabled,
}: ConversationRailProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['playground-conversations'],
    queryFn: listConversations,
    staleTime: 15_000,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['playground-conversations'],
      })
      toast.success(t('Conversation deleted'))
    },
    onError: () => toast.error(t('Failed to delete conversation')),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.title.toLowerCase().includes(q))
  }, [items, search])

  return (
    <aside className='bg-surface-inset border-border flex h-full w-[240px] shrink-0 flex-col border-r'>
      <div className='border-border space-y-3 border-b px-3 py-3'>
        <div className='flex items-center justify-between gap-2'>
          <Eyebrow>{t('Chats')}</Eyebrow>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            disabled={disabled}
            onClick={onNew}
            aria-label={t('New chat')}
            title={t('New chat')}
          >
            <Plus className='size-4' />
          </Button>
        </div>
        <FilterBarSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Search chats')}
          aria-label={t('Search chats')}
          containerClassName='max-w-none sm:max-w-none'
        />
      </div>
      <nav
        aria-label={t('Conversations')}
        className='min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-2'
      >
        {isLoading && (
          <p className='text-muted-foreground px-2 py-2 font-mono text-xs'>
            {t('Loading…')}
          </p>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className='text-muted-foreground px-2 py-2 font-mono text-xs'>
            {t('No conversations yet')}
          </p>
        )}
        {filtered.map((item: ConversationListItem) => (
          <div key={item.id} className='group relative'>
            <ConversationRailItem
              title={item.title || t('New chat')}
              sub={formatDistanceToNow(new Date(item.updated_time * 1000), {
                addSuffix: true,
              })}
              active={activeId === item.id}
              disabled={disabled}
              onClick={() => onSelect(item.id)}
              className='pe-8'
            />
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='absolute end-1 top-1/2 size-6 -translate-y-1/2 opacity-0 group-hover:opacity-100'
              aria-label={t('Delete conversation')}
              onClick={(e) => {
                e.stopPropagation()
                if (
                  window.confirm(
                    t('Delete this conversation? This cannot be undone.')
                  )
                ) {
                  deleteMutation.mutate(item.id, {
                    onSuccess: () => {
                      if (activeId === item.id) onNew()
                    },
                  })
                }
              }}
            >
              <Trash2 className='size-3.5' />
            </Button>
          </div>
        ))}
      </nav>
    </aside>
  )
}
