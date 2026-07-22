import { useEffect, useRef, useState } from 'react'
import {
  Columns3,
  Ellipsis,
  FileJson,
  FileText,
  PanelLeft,
  BookmarkPlus,
  SlidersHorizontal,
  SquarePen,
  Terminal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface ChatTopbarProps {
  /** Current conversation title (already resolved: override or derived). */
  title: string
  /** Whether a conversation exists (messages or a saved thread). */
  hasConversation: boolean
  onRenameTitle: (title: string) => void
  renameDisabled?: boolean
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onOpenMobileSidebar: () => void
  onNewChat: () => void
  newChatDisabled?: boolean
  compareCount: number
  onOpenCompare: () => void
  onOpenAdvanced: () => void
  onOpenPresets: () => void
  exportDisabled?: boolean
  onExportMarkdown: () => void
  onExportJson: () => void
  onCopyCurl: () => void
}

/**
 * ChatTopbar — Claude-style minimal chat chrome: sidebar toggle + new chat
 * on the left, an editable conversation title in the middle, and a single
 * overflow menu on the right hosting every tool-grade action.
 */
export function ChatTopbar(props: ChatTopbarProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEditing = () => {
    if (props.renameDisabled || !props.hasConversation) return
    setDraft(props.title)
    setEditing(true)
  }

  const commitEditing = () => {
    setEditing(false)
    const next = draft.trim()
    if (!next || next === props.title) return
    props.onRenameTitle(next)
  }

  return (
    <header className='border-border/70 bg-bg relative z-10 flex h-12 shrink-0 items-center gap-1 border-b px-2 sm:px-3'>
      <Button
        variant='ghost'
        size='icon-sm'
        className='lg:hidden'
        onClick={props.onOpenMobileSidebar}
        aria-label={t('Open chat history')}
        title={t('Open chat history')}
      >
        <PanelLeft className='size-4' />
      </Button>
      <Button
        variant='ghost'
        size='icon-sm'
        className='hidden lg:inline-flex'
        onClick={props.onToggleSidebar}
        aria-label={props.sidebarCollapsed ? t('Show sidebar') : t('Hide sidebar')}
        title={props.sidebarCollapsed ? t('Show sidebar') : t('Hide sidebar')}
      >
        <PanelLeft className='size-4' />
      </Button>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={props.onNewChat}
        disabled={props.newChatDisabled}
        aria-label={t('New chat')}
        title={t('New chat')}
      >
        <SquarePen className='size-4' />
      </Button>

      <div className='flex min-w-0 flex-1 items-center justify-center px-2'>
        {editing ? (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitEditing}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitEditing()
              if (event.key === 'Escape') setEditing(false)
            }}
            className='h-7 max-w-sm text-center text-[13px]'
            aria-label={t('Conversation title')}
          />
        ) : (
          props.hasConversation && (
            <button
              type='button'
              onClick={startEditing}
              disabled={props.renameDisabled}
              className={cn(
                'text-foreground hover:bg-surface-hover max-w-full truncate rounded-md px-2 py-1 text-[13px] font-medium transition-colors',
                props.renameDisabled && 'pointer-events-none'
              )}
              title={t('Rename conversation')}
            >
              {props.title}
            </button>
          )
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='ghost'
              size='icon-sm'
              aria-label={t('Chat options')}
              title={t('Chat options')}
            />
          }
        >
          <Ellipsis className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuItem onClick={props.onOpenAdvanced}>
            <SlidersHorizontal className='size-4' />
            {t('Advanced settings')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onOpenCompare}>
            <Columns3 className='size-4' />
            {t('Compare models')}
            {props.compareCount > 0 && (
              <Badge variant='secondary' className='ml-auto px-1.5 text-[10px]'>
                {props.compareCount + 1}
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onOpenPresets}>
            <BookmarkPlus className='size-4' />
            {t('Presets')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={props.exportDisabled}
            onClick={props.onExportMarkdown}
          >
            <FileText className='size-4' />
            {t('Export Markdown')}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={props.exportDisabled}
            onClick={props.onExportJson}
          >
            <FileJson className='size-4' />
            {t('Export JSON')}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={props.exportDisabled}
            onClick={props.onCopyCurl}
          >
            <Terminal className='size-4' />
            {t('Copy as cURL')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
