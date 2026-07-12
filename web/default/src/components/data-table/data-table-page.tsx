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
import * as React from 'react'
import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageFooterPortal } from '@/components/layout'
import { MobileCardList } from './mobile-card-list'
import { DataTablePagination } from './pagination'
import { TableEmpty } from './table-empty'
import { TableSkeleton } from './table-skeleton'
import { DataTableToolbar } from './toolbar'

/**
 * Pass-through configuration for the default {@link DataTableToolbar}.
 * Pass `toolbar` (ReactNode) instead to fully replace the default toolbar.
 */
export type DataTablePageToolbarProps<TData> = Omit<
  React.ComponentProps<typeof DataTableToolbar<TData>>,
  'table'
>

export type DataTablePageProps<TData> = {
  /**
   * TanStack Table instance returned from `useReactTable`.
   */
  table: TanstackTable<TData>

  /**
   * Column definitions. Used for skeleton column count and empty-state colSpan.
   */
  columns: ColumnDef<TData, unknown>[]

  /**
   * Initial loading state — renders {@link TableSkeleton} or mobile skeleton.
   */
  isLoading?: boolean

  /**
   * Refetch / background loading — dims the table without removing rows.
   */
  isFetching?: boolean

  /**
   * Load-failure state. When true (and not loading), renders an error
   * placeholder with a retry action instead of the empty state, so a failed
   * fetch is visually distinct from "no data".
   */
  isError?: boolean

  /**
   * Retry handler for the error state — typically the query's `refetch`.
   */
  onRetry?: () => void

  /**
   * Empty-state title (used for both desktop {@link TableEmpty} and mobile fallback).
   */
  emptyTitle?: string

  /**
   * Empty-state description.
   */
  emptyDescription?: string

  /**
   * Empty-state icon override (desktop only; mobile uses default Database icon).
   */
  emptyIcon?: React.ReactNode

  /**
   * Empty-state extra content — e.g. a "Create" button below the message.
   */
  emptyAction?: React.ReactNode

  /**
   * Stat header slot — typically a {@link StatCardRow} of StatCards
   * rendered above the toolbar (table v2 anatomy: stats → filters → table).
   */
  statHeader?: React.ReactNode

  /**
   * Custom toolbar node — fully replaces the default {@link DataTableToolbar}.
   * Useful for layouts like "primary buttons + toolbar" or feature-specific filter cards.
   * If provided, `toolbarProps` is ignored.
   */
  toolbar?: React.ReactNode

  /**
   * Pass-through props for the default {@link DataTableToolbar}.
   * Ignored if `toolbar` is provided. Pass `null` to omit the toolbar entirely.
   */
  toolbarProps?: DataTablePageToolbarProps<TData> | null

  /**
   * Bulk action bar — typically a wrapped {@link DataTableBulkActions} component.
   * Rendered only on desktop (mobile selection is uncommon).
   */
  bulkActions?: React.ReactNode

  /**
   * Custom mobile list node — fully replaces the default {@link MobileCardList}.
   */
  mobile?: React.ReactNode

  /**
   * Pass-through props for the default {@link MobileCardList}.
   * Ignored if `mobile` is provided.
   */
  mobileProps?: {
    getRowKey?: (row: Row<TData>) => string | number
    getRowClassName?: (row: Row<TData>) => string | undefined
  }

  /**
   * Disable the mobile-specific layout entirely — always renders desktop table.
   * Useful for pages where the table is read-only and short.
   */
  hideMobile?: boolean

  /**
   * Row className resolver — applied to both desktop `TableRow` and mobile card.
   * Composes with the default `data-state="selected"` styling on desktop.
   * The `ctx.isMobile` flag is provided so consumers can return the
   * appropriate variant (e.g. `DISABLED_ROW_DESKTOP` vs `DISABLED_ROW_MOBILE`)
   * without having to re-call `useMediaQuery` themselves.
   */
  getRowClassName?: (
    row: Row<TData>,
    ctx: { isMobile: boolean }
  ) => string | undefined

  /**
   * Custom desktop row renderer — replaces the default `<TableRow>`/`<TableCell>` mapping.
   * Use for expanded rows, aggregate rows, click-on-row navigation, etc.
   */
  renderRow?: (row: Row<TData>) => React.ReactNode

  /**
   * Apply explicit column widths from `header.getSize()` to `<TableHead>`.
   * Enable this when your column definitions include `size` and you want it honored.
   * Off by default (TanStack Table assigns a default size of 150 to all columns
   * which would unintentionally constrain layouts that don't define sizes).
   */
  applyHeaderSize?: boolean

  /**
   * Optional skeleton key prefix for stable React keys across re-renders.
   */
  skeletonKeyPrefix?: string

  /**
   * Whether to render pagination. Defaults to `true`.
   */
  showPagination?: boolean

  /**
   * Render pagination via `PageFooterPortal` (sticks to page footer).
   * Defaults to `true`. Set `false` to render inline below the table.
   */
  paginationInFooter?: boolean

  /**
   * Extra content rendered between the table/mobile list and the pagination.
   * E.g. summary stats, helper text.
   */
  afterTable?: React.ReactNode

  /**
   * Outer wrapper className (applied to the toolbar+table column).
   */
  className?: string

  /**
   * Desktop table container className (the bordered scroll wrapper).
   */
  tableClassName?: string

  /**
   * Desktop `<TableHeader>` className override.
   * Useful for sticky headers (`'sticky top-0 z-10 bg-muted/30'`) on long lists.
   */
  tableHeaderClassName?: string

  /**
   * Pin the last visible column (usually row actions / details) to the right
   * edge of the table scroll container so operators can act without H-scrolling.
   * Only applies to the default header/row renderers — custom `renderRow` must
   * apply {@link STICKY_ACTIONS_HEAD_CLASS} / {@link STICKY_ACTIONS_CELL_CLASS}
   * itself on the last cell.
   */
  stickyActions?: boolean
}

/** Sticky-right header cell styles (matches TableHeader surface). */
export const STICKY_ACTIONS_HEAD_CLASS =
  'sticky right-0 z-20 bg-surface-inset shadow-[-8px_0_8px_-8px_rgb(0_0_0_/_0.12)]'

/**
 * Sticky-right body cell styles. Tracks row hover/selected surfaces so the
 * pinned column does not flash a different background while scrolling.
 */
export const STICKY_ACTIONS_CELL_CLASS =
  'sticky right-0 z-10 bg-background group-hover/row:bg-surface-hover group-data-[state=selected]/row:bg-surface-2 shadow-[-8px_0_8px_-8px_rgb(0_0_0_/_0.12)]'

/**
 * Unified table page wrapper. Encapsulates the canonical structure used across
 * all list pages: toolbar → desktop table / mobile list → pagination, plus
 * loading/empty states and an opt-in bulk action bar.
 *
 * Most pages should be expressible as:
 * ```tsx
 * <DataTablePage
 *   table={table}
 *   columns={columns}
 *   isLoading={isLoading}
 *   isFetching={isFetching}
 *   emptyTitle={t('No X Found')}
 *   toolbarProps={{ searchPlaceholder: t('Filter...'), filters }}
 *   bulkActions={<MyBulkActions table={table} />}
 * />
 * ```
 *
 * For complex layouts (custom mobile, expanded rows, custom toolbar), use the
 * `toolbar` / `mobile` / `renderRow` slots instead of the `*Props` variants.
 */
export function DataTablePage<TData>(props: DataTablePageProps<TData>) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const showMobile = isMobile && !props.hideMobile

  const toolbarNode = renderToolbar(props)
  const mobileNode = renderMobile(props, showMobile)
  const desktopNode = renderDesktop(props, showMobile)

  return (
    <>
      <div className={cn('space-y-2.5 sm:space-y-3', props.className)}>
        {props.statHeader}
        {toolbarNode}
        {mobileNode}
        {desktopNode}
        {props.afterTable}
      </div>

      {/* Bulk actions are typically a fixed-position toolbar; let the consumer
          handle its own visibility, we just gate it to non-mobile. */}
      {!showMobile && props.bulkActions}

      {props.showPagination !== false &&
        (props.paginationInFooter !== false ? (
          <PageFooterPortal>
            <DataTablePagination table={props.table} />
          </PageFooterPortal>
        ) : (
          <div className='pt-2'>
            <DataTablePagination table={props.table} />
          </div>
        ))}
    </>
  )
}

function renderToolbar<TData>(
  props: DataTablePageProps<TData>
): React.ReactNode {
  if (props.toolbar !== undefined) {
    return props.toolbar
  }
  if (props.toolbarProps === null) {
    return null
  }
  if (props.toolbarProps) {
    return <DataTableToolbar table={props.table} {...props.toolbarProps} />
  }
  return null
}

function renderMobile<TData>(
  props: DataTablePageProps<TData>,
  showMobile: boolean
): React.ReactNode {
  if (!showMobile) return null
  if (props.mobile !== undefined) return props.mobile

  const ownGetRowClassName = props.getRowClassName
  const mobileGetRowClassName =
    props.mobileProps?.getRowClassName ??
    (ownGetRowClassName
      ? (row: Row<TData>) => ownGetRowClassName(row, { isMobile: true })
      : undefined)

  return (
    <MobileCardList
      table={props.table}
      isLoading={props.isLoading}
      isError={props.isError}
      onRetry={props.onRetry}
      emptyTitle={props.emptyTitle}
      emptyDescription={props.emptyDescription}
      getRowKey={props.mobileProps?.getRowKey}
      getRowClassName={mobileGetRowClassName}
    />
  )
}

function renderDesktop<TData>(
  props: DataTablePageProps<TData>,
  showMobile: boolean
): React.ReactNode {
  if (showMobile) return null

  const rows = props.table.getRowModel().rows
  const isFetchingOnly = props.isFetching && !props.isLoading

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border transition-opacity duration-150',
        isFetchingOnly && 'pointer-events-none opacity-60',
        props.tableClassName
      )}
    >
      <Table>
        <TableHeader className={props.tableHeaderClassName}>
          {props.table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, headerIndex) => {
                const isLast =
                  props.stickyActions &&
                  headerIndex === headerGroup.headers.length - 1
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={isLast ? STICKY_ACTIONS_HEAD_CLASS : undefined}
                    style={
                      props.applyHeaderSize
                        ? { width: header.getSize() }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {props.isLoading ? (
            <TableSkeleton
              table={props.table}
              keyPrefix={props.skeletonKeyPrefix}
            />
          ) : props.isError && rows.length === 0 ? (
            <TableErrorRow
              colSpan={props.columns.length}
              onRetry={props.onRetry}
            />
          ) : rows.length === 0 ? (
            <TableEmpty
              colSpan={props.columns.length}
              title={props.emptyTitle}
              description={props.emptyDescription}
              icon={props.emptyIcon}
            >
              {props.emptyAction}
            </TableEmpty>
          ) : (
            rows.map((row) => {
              if (props.renderRow) {
                return props.renderRow(row)
              }
              return (
                <DefaultRow
                  key={row.id}
                  row={row}
                  stickyActions={props.stickyActions}
                  className={props.getRowClassName?.(row, { isMobile: false })}
                />
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function TableErrorRow({
  colSpan,
  onRetry,
}: {
  colSpan: number
  onRetry?: () => void
}) {
  const { t } = useTranslation()
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='h-[400px] p-0'>
        <div className='sticky left-0 w-[100cqw]'>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <AlertTriangle className='text-destructive size-6' />
              </EmptyMedia>
              <EmptyTitle>{t('Failed to load')}</EmptyTitle>
              <EmptyDescription>
                {t('Could not load data. Please try again.')}
              </EmptyDescription>
            </EmptyHeader>
            {onRetry && (
              <EmptyContent>
                <Button variant='outline' size='sm' onClick={onRetry}>
                  {t('Try again')}
                </Button>
              </EmptyContent>
            )}
          </Empty>
        </div>
      </TableCell>
    </TableRow>
  )
}

function DefaultRow<TData>({
  row,
  className,
  stickyActions,
}: {
  row: Row<TData>
  className?: string
  stickyActions?: boolean
}) {
  const cells = row.getVisibleCells()
  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      className={cn('group/row', className)}
    >
      {cells.map((cell, cellIndex) => {
        const isLast = stickyActions && cellIndex === cells.length - 1
        return (
          <TableCell
            key={cell.id}
            className={isLast ? STICKY_ACTIONS_CELL_CLASS : undefined}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}
