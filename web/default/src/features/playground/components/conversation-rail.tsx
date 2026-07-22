import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { differenceInCalendarDays, isToday, isYesterday } from 'date-fns'
import { Ellipsis, Pencil, SquarePen, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { formatQuota } from '@/lib/format'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConversationRailItem } from '@/components/ai-elements/conversation-rail-item'
import { FilterBarSearch } from '@/components/data-table'
import {
  deleteConversation,
  getConversation,
  listConversations,
  updateConversation,
} from '../api'
import type { ConversationListItem } from '../types'

interface ConversationRailProps {
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  /** Called after a conversation was renamed (id, new title). */
  onRenamed?: (id: number, title: string) => void
  disabled?: boolean
  className?: string
}

type GroupKey = 'today' | 'yesterday' | 'week' | 'older'

const GROUP_ORDER: GroupKey[] = ['today', 'yesterday', 'week', 'older']

const GROUP_LABEL_KEYS: Record<GroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Previous 7 days',
  older: 'Older',
}

function groupKeyFor(updatedTimeSec: number): GroupKey {
  const date = new Date(updatedTimeSec * 1000)
  if (isToday(date)) return 'today'
  if (isYesterday(date)) return 'yesterday'
  if (differenceInCalendarDays(new Date(), date) <= 7) return 'week'
  return 'older'
}

function RailGroupLabel(props: { children: React.ReactNode }) {
  return (
    <div className='text-muted-foreground px-3 pt-4 pb-1 font-mono text-[10px] tracking-[0.14em] uppercase select-none first:pt-1'>
      {props.children}
    </div>
  )
}

/**
 * ConversationRail — Claude-style chat history sidebar: new chat + search
 * on top, date-grouped recents with rename/delete row menus, and the
 * signed-in user card at the bottom.
 */
export function ConversationRail(props: ConversationRailProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.auth.user)
  const [search, setSearch] = useState('')
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ConversationListItem | null>(
    null
  )
  const renameInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (renamingId != null) renameInputRef.current?.focus()
  }, [renamingId])

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['playground-conversations'],
    queryFn: listConversations,
    staleTime: 15_000,
  })

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ['playground-conversations'] })

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      void invalidateList()
      toast.success(t('Conversation deleted'))
    },
    onError: () => toast.error(t('Failed to delete conversation')),
  })

  // The update endpoint overwrites config wholesale, so re-send the stored
  // document alongside the new title to avoid clearing it.
  const renameMutation = useMutation({
    mutationFn: async (input: { id: number; title: string }) => {
      const conv = await getConversation(input.id)
      if (!conv) throw new Error('conversation not found')
      await updateConversation(input.id, {
        title: input.title,
        messages: conv.messages,
        config: conv.config,
      })
      return input
    },
    onSuccess: (input) => {
      void invalidateList()
      props.onRenamed?.(input.id, input.title)
    },
    onError: () => toast.error(t('Failed to rename conversation')),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.title.toLowerCase().includes(q))
  }, [items, search])

  const groups = useMemo(() => {
    const buckets: Record<GroupKey, ConversationListItem[]> = {
      today: [],
      yesterday: [],
      week: [],
      older: [],
    }
    for (const item of filtered) {
      buckets[groupKeyFor(item.updated_time)].push(item)
    }
    return buckets
  }, [filtered])

  const startRename = (item: ConversationListItem) => {
    setRenameDraft(item.title)
    setRenamingId(item.id)
  }

  const commitRename = () => {
    const id = renamingId
    setRenamingId(null)
    if (id == null) return
    const next = renameDraft.trim()
    const current = items.find((item) => item.id === id)
    if (!next || next === current?.title) return
    renameMutation.mutate({ id: id, title: next })
  }

  const displayName = user?.display_name || user?.username || ''
  const initials = displayName.slice(0, 2).toUpperCase() || 'ME'

  const renderItem = (item: ConversationListItem) => {
    if (renamingId === item.id) {
      return (
        <div key={item.id} className='px-1 py-1'>
          <Input
            ref={renameInputRef}
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitRename()
              if (event.key === 'Escape') setRenamingId(null)
            }}
            className='h-8 text-[13px]'
            aria-label={t('Conversation title')}
          />
        </div>
      )
    }
    return (
      <div key={item.id} className='group relative'>
        <ConversationRailItem
          title={item.title || t('New chat')}
          active={props.activeId === item.id}
          disabled={props.disabled}
          onClick={() => props.onSelect(item.id)}
          className='py-2 pe-8'
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className={cn(
                  'absolute end-1 top-1/2 size-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100'
                )}
                aria-label={t('Conversation actions')}
              />
            }
          >
            <Ellipsis className='size-3.5' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-40'>
            <DropdownMenuItem onClick={() => startRename(item)}>
              <Pencil className='size-4' />
              {t('Rename')}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => setDeleteTarget(item)}
            >
              <Trash2 className='size-4' />
              {t('Delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'bg-surface-inset border-border flex h-full w-[260px] shrink-0 flex-col border-r',
        props.className
      )}
    >
      <div className='space-y-2 px-3 pt-3 pb-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={props.disabled}
          onClick={props.onNew}
          className='w-full justify-start gap-2'
        >
          <SquarePen className='size-4' />
          {t('New chat')}
        </Button>
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
        className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'
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
        {GROUP_ORDER.map((key) => {
          const groupItems = groups[key]
          if (groupItems.length === 0) return null
          return (
            <div key={key}>
              <RailGroupLabel>{t(GROUP_LABEL_KEYS[key])}</RailGroupLabel>
              <div className='space-y-0.5'>{groupItems.map(renderItem)}</div>
            </div>
          )
        })}
      </nav>
      <div className='border-border flex items-center gap-3 border-t px-4 py-3'>
        <Avatar size='sm'>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='text-foreground truncate text-[13px] font-semibold'>
            {displayName}
          </div>
        </div>
        <span className='text-muted-foreground shrink-0 font-mono text-[11px]'>
          {formatQuota(user?.quota ?? 0)}
        </span>
      </div>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        destructive
        title={t('Delete conversation')}
        desc={t(
          'Delete “{{title}}”? This cannot be undone.',
          { title: deleteTarget?.title || t('New chat') }
        )}
        confirmText={t('Delete')}
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (!deleteTarget) return
          const target = deleteTarget
          deleteMutation.mutate(target.id, {
            onSuccess: () => {
              setDeleteTarget(null)
              if (props.activeId === target.id) props.onNew()
            },
          })
        }}
      />
    </aside>
  )
}
