import dayjs from 'dayjs'
import type { TFunction } from 'i18next'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  OctagonAlert,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Markdown } from '@/components/ui/markdown'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FilterChips,
  NotificationGroup,
  NotificationItem,
  type FilterChipItem,
} from '@/components/patterns'

interface AnnouncementItem {
  type?: string
  content?: string
  extra?: string
  publishDate?: string | Date
}

export type NotificationFilter = 'all' | 'notice' | 'announcements'

interface NotificationPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unreadCount: number
  activeTab: NotificationFilter
  onTabChange: (tab: NotificationFilter) => void
  notice: string
  announcements: AnnouncementItem[]
  loading: boolean
  /**
   * Clears the unread state (notice + announcements) in the consumer's
   * read-tracking store. The "Mark all read" button only renders when
   * this callback is provided and unreadCount > 0.
   */
  onMarkAllRead?: () => void
  className?: string
}

type NotificationTone = 'brand' | 'success' | 'warning' | 'danger' | 'info'

interface AnnouncementTypeMeta {
  tone: NotificationTone
  icon: LucideIcon
  label: string
}

/**
 * Announcement type → tone/icon/title mapping. Types mirror
 * AnnouncementType in lib/colors (default/ongoing/success/warning/error).
 */
const ANNOUNCEMENT_TYPE_META: Record<string, AnnouncementTypeMeta> = {
  success: { tone: 'success', icon: CheckCircle2, label: 'Success' },
  warning: { tone: 'warning', icon: AlertTriangle, label: 'Warning' },
  error: { tone: 'danger', icon: OctagonAlert, label: 'Error' },
  danger: { tone: 'danger', icon: OctagonAlert, label: 'Error' },
  ongoing: { tone: 'info', icon: Info, label: 'In Progress' },
  info: { tone: 'info', icon: Info, label: 'Info' },
  default: { tone: 'brand', icon: Megaphone, label: 'Announcement' },
}

function getAnnouncementTypeMeta(type?: string): AnnouncementTypeMeta {
  return (
    ANNOUNCEMENT_TYPE_META[(type || 'default').toLowerCase()] ??
    ANNOUNCEMENT_TYPE_META.default
  )
}

/** Short mono timestamp for notification rows: now / 12m / 3h / 2d / MM-DD. */
function formatShortTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return dayjs(date).format('MM-DD')
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return dayjs(date).format('MM-DD')
}

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function parsePublishDate(publishDate?: string | Date): Date | null {
  if (!publishDate) return null
  const date = new Date(publishDate)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Empty state component
 */
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <Empty className='min-h-48 border-0 p-4'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
    </Empty>
  )
}

function AnnouncementRow({ item }: { item: AnnouncementItem }) {
  const { t } = useTranslation()
  const meta = getAnnouncementTypeMeta(item.type)
  const Icon = meta.icon
  const publishDate = parsePublishDate(item.publishDate)

  return (
    <NotificationItem
      tone={meta.tone}
      icon={<Icon />}
      title={t(meta.label)}
      body={
        <>
          <Markdown>{item.content || ''}</Markdown>
          {item.extra ? (
            <div className='text-muted-foreground mt-1 text-xs'>
              <Markdown>{item.extra}</Markdown>
            </div>
          ) : null}
        </>
      }
      time={publishDate ? formatShortTime(publishDate) : undefined}
    />
  )
}

function NoticeRow({ notice }: { notice: string }) {
  const { t } = useTranslation()
  return (
    <NotificationItem
      tone='info'
      icon={<Bell />}
      title={t('Notice')}
      body={<Markdown>{notice}</Markdown>}
    />
  )
}

/**
 * Notification list: notice row + announcements grouped by publish date
 * (today / earlier), filtered by the active chip.
 */
function NotificationList({
  filter,
  notice,
  announcements,
  loading,
  t,
}: {
  filter: NotificationFilter
  notice: string
  announcements: AnnouncementItem[]
  loading: boolean
  t: TFunction
}) {
  if (loading) {
    return (
      <EmptyState
        icon={<Bell />}
        title={t('Loading...')}
        description={t('Latest platform updates and notices')}
      />
    )
  }

  const showNotice = (filter === 'all' || filter === 'notice') && !!notice
  const showAnnouncements =
    (filter === 'all' || filter === 'announcements') && announcements.length > 0

  if (!showNotice && !showAnnouncements) {
    if (filter === 'announcements') {
      return (
        <EmptyState icon={<Megaphone />} title={t('No system announcements')} />
      )
    }
    return (
      <EmptyState icon={<Bell />} title={t('No announcements at this time')} />
    )
  }

  // Group announcements by publish date; unparseable dates go to "earlier".
  const todayItems: AnnouncementItem[] = []
  const earlierItems: AnnouncementItem[] = []
  if (showAnnouncements) {
    for (const item of announcements) {
      const publishDate = parsePublishDate(item.publishDate)
      if (publishDate && isToday(publishDate)) {
        todayItems.push(item)
      } else {
        earlierItems.push(item)
      }
    }
  }

  return (
    <div className='overflow-hidden rounded-lg border'>
      <ScrollArea className='h-[min(52vh,28rem)]'>
        {showNotice && <NoticeRow notice={notice} />}
        {todayItems.length > 0 && (
          <NotificationGroup label={t('today')}>
            {todayItems.map((item, idx) => (
              <AnnouncementRow key={`today-${idx}`} item={item} />
            ))}
          </NotificationGroup>
        )}
        {earlierItems.length > 0 && (
          <NotificationGroup label={t('earlier')}>
            {earlierItems.map((item, idx) => (
              <AnnouncementRow key={`earlier-${idx}`} item={item} />
            ))}
          </NotificationGroup>
        )}
      </ScrollArea>
    </div>
  )
}

/**
 * Notification popover with All / Notice / Announcements filter chips
 * and date-grouped notification rows.
 */
export function NotificationPopover({
  open,
  onOpenChange,
  unreadCount,
  activeTab,
  onTabChange,
  notice,
  announcements,
  loading,
  onMarkAllRead,
  className,
}: NotificationPopoverProps) {
  const { t } = useTranslation()

  const chipItems: FilterChipItem<NotificationFilter>[] = [
    {
      value: 'all',
      label: t('All'),
      count: announcements.length + (notice ? 1 : 0),
    },
    { value: 'notice', label: t('Notice') },
    {
      value: 'announcements',
      label: t('Announcements'),
      count: announcements.length,
    },
  ]

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className={cn('relative size-9', className)}
            aria-label={t('Notifications')}
          />
        }
      >
        <Bell className='size-[1.2rem]' />
        {unreadCount > 0 ? (
          <Badge
            variant='destructive'
            className='absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center px-1 text-[10px] font-semibold tabular-nums'
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-[min(26rem,calc(100vw-1rem))] gap-3 p-3'
      >
        <PopoverHeader className='gap-1 px-1'>
          <PopoverTitle>{t('System Announcements')}</PopoverTitle>
          <p className='text-muted-foreground text-xs'>
            {t('Latest platform updates and notices')}
          </p>
        </PopoverHeader>

        <FilterChips
          items={chipItems}
          value={activeTab}
          onValueChange={onTabChange}
          label={t('Filter notifications')}
        />

        <NotificationList
          filter={activeTab}
          notice={notice}
          announcements={announcements}
          loading={loading}
          t={t}
        />

        <div className='flex items-center justify-end gap-2'>
          {unreadCount > 0 && onMarkAllRead && (
            <Button variant='outline' size='sm' onClick={onMarkAllRead}>
              {t('Mark all read')}
            </Button>
          )}
          <Button size='sm' onClick={() => onOpenChange(false)}>
            {t('Close')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
