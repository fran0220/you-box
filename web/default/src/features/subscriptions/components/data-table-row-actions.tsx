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
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RowActionButton, RowActions } from '@/components/data-table'
import type { PlanRecord } from '../types'
import { useSubscriptions } from './subscriptions-provider'

interface DataTableRowActionsProps {
  row: Row<PlanRecord>
}

/**
 * Row actions (r2-B10 §3, mirroring channels): Edit is a hover-revealed
 * icon button; Enable/Disable stays in the More dropdown (it is also
 * reachable via the inline status Switch). Everything keeps the
 * compliance gate — actions are disabled until terms are confirmed.
 */
export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow, complianceConfirmed } = useSubscriptions()

  const handleEdit = () => {
    setCurrentRow(row.original)
    setOpen('update')
  }

  const handleToggleStatus = () => {
    setCurrentRow(row.original)
    setOpen('toggle-status')
  }

  return (
    <RowActions>
      <RowActionButton
        label={t('Edit')}
        onClick={handleEdit}
        disabled={!complianceConfirmed}
      >
        <Pencil className='size-4' />
      </RowActionButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <RowActionButton
              label={t('Open menu')}
              className='data-popup-open:bg-muted'
            />
          }
        >
          <MoreHorizontal className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          <DropdownMenuItem
            disabled={!complianceConfirmed}
            onClick={handleEdit}
          >
            {t('Edit')}
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!complianceConfirmed}
            onClick={handleToggleStatus}
          >
            {row.original.plan.enabled ? t('Disable') : t('Enable')}
            <DropdownMenuShortcut>
              {row.original.plan.enabled ? (
                <PowerOff size={16} />
              ) : (
                <Power size={16} />
              )}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </RowActions>
  )
}
