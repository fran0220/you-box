import { type Row } from '@tanstack/react-table'
import {
  Trash2,
  Edit,
  Power,
  PowerOff,
  Copy,
  MoreHorizontal as DotsHorizontalIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RowActionButton, RowActions } from '@/components/data-table'
import { updateRedemptionStatus } from '../api'
import { REDEMPTION_STATUS, SUCCESS_MESSAGES } from '../constants'
import { isRedemptionExpired } from '../lib'
import { redemptionSchema } from '../types'
import { useRedemptions } from './redemptions-provider'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

/**
 * Row actions (r2-B9 §3): Copy code is a hover-revealed icon button;
 * edit / enable-disable / delete stay in the More dropdown.
 */
export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { t } = useTranslation()
  const redemption = redemptionSchema.parse(row.original)
  const { setOpen, setCurrentRow, triggerRefresh } = useRedemptions()
  const { copyToClipboard } = useCopyToClipboard()
  const isEnabled = redemption.status === REDEMPTION_STATUS.ENABLED
  const isUsed = redemption.status === REDEMPTION_STATUS.USED
  const isExpired = isRedemptionExpired(
    redemption.expired_time,
    redemption.status
  )

  const handleToggleStatus = async () => {
    const newStatus = isEnabled
      ? REDEMPTION_STATUS.DISABLED
      : REDEMPTION_STATUS.ENABLED

    const result = await updateRedemptionStatus(redemption.id, newStatus)
    if (result.success) {
      const message = isEnabled
        ? t(SUCCESS_MESSAGES.REDEMPTION_DISABLED)
        : t(SUCCESS_MESSAGES.REDEMPTION_ENABLED)
      toast.success(message)
      triggerRefresh()
    }
  }

  const canEdit = isEnabled && !isExpired
  const canToggle = !isUsed && !isExpired

  return (
    <RowActions>
      <RowActionButton
        label={t('Copy code')}
        onClick={() => copyToClipboard(redemption.key)}
      >
        <Copy className='size-4' />
      </RowActionButton>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <RowActionButton
              label={t('Open menu')}
              className='data-popup-open:bg-muted'
            />
          }
        >
          <DotsHorizontalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(redemption)
              setOpen('update')
            }}
            disabled={!canEdit}
          >
            {t('Edit')}
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {canToggle && (
            <DropdownMenuItem onClick={handleToggleStatus}>
              {isEnabled ? (
                <>
                  {t('Disable')}
                  <DropdownMenuShortcut>
                    <PowerOff size={16} />
                  </DropdownMenuShortcut>
                </>
              ) : (
                <>
                  {t('Enable')}
                  <DropdownMenuShortcut>
                    <Power size={16} />
                  </DropdownMenuShortcut>
                </>
              )}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(redemption)
              setOpen('delete')
            }}
            className='text-destructive focus:text-destructive'
          >
            {t('Delete')}
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </RowActions>
  )
}
