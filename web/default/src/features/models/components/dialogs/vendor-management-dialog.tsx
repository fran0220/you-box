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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Loader2, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Dialog } from '@/components/dialog'
import { EmptyState } from '@/components/youbox'
import { StatusBadge } from '@/components/status-badge'
import { TableId } from '@/components/table-id'
import { getVendors } from '../../api'
import { vendorsQueryKeys } from '../../lib'
import { handleDeleteVendor } from '../../lib/vendor-actions'
import type { Vendor } from '../../types'
import { useModels } from '../models-provider'

type VendorManagementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VendorManagementDialog({
  open,
  onOpenChange,
}: VendorManagementDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const { setOpen, setCurrentVendor } = useModels()
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: vendorsQueryKeys.list(),
    queryFn: () => getVendors({ page_size: 1000 }),
    enabled: open,
  })

  const vendors = useMemo(() => data?.data?.items ?? [], [data?.data?.items])
  const vendorTotal = data?.data?.total ?? vendors.length

  const sortedVendors = useMemo(
    () => [...vendors].sort((a, b) => a.name.localeCompare(b.name)),
    [vendors]
  )

  const handleCreate = () => {
    setCurrentVendor(null)
    setOpen('create-vendor')
  }

  const handleEdit = (vendor: Vendor) => {
    setCurrentVendor(vendor)
    setOpen('update-vendor')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await handleDeleteVendor(deleteTarget.id, queryClient, () => {
        setDeleteTarget(null)
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={
          <span className='flex items-center gap-2'>
            <Building2 className='text-muted-foreground h-5 w-5' aria-hidden />
            {t('Manage Vendors')}
          </span>
        }
        description={t(
          'Create, edit, and remove model vendors used in the catalog and filters.'
        )}
        contentClassName={cn(
          'w-[calc(100vw-2rem)] sm:max-w-[48rem]',
          isMobile && 'max-w-none rounded-none'
        )}
        contentHeight='auto'
        bodyClassName='space-y-4'
      >
        <div className='bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-md border p-2 text-sm'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button size='sm' onClick={handleCreate}>
              <Plus className='mr-2 h-4 w-4' aria-hidden />
              {t('Create Vendor')}
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden />
              ) : (
                <RefreshCcw className='mr-2 h-4 w-4' aria-hidden />
              )}
              {t('Refresh')}
            </Button>
          </div>
          <StatusBadge
            label={t('{{count}} vendors', { count: vendorTotal })}
            variant='neutral'
            copyable={false}
          />
        </div>

        {error ? (
          <EmptyState
            title={t('Unable to load vendors')}
            description={(error as Error).message || t('Please retry.')}
            actionLabel={t('Retry')}
            onAction={() => void refetch()}
          />
        ) : isLoading ? (
          <div className='flex flex-col items-center justify-center gap-2 py-12'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
            <p className='text-muted-foreground text-sm'>
              {t('Loading vendors...')}
            </p>
          </div>
        ) : sortedVendors.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t('No vendors yet')}
            description={t(
              'Add a vendor to organize models and enable vendor filters.'
            )}
            actionLabel={t('Create Vendor')}
            onAction={handleCreate}
          />
        ) : (
          <div className='border-border overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='font-mono text-xs uppercase tracking-wide'>
                    {t('ID')}
                  </TableHead>
                  <TableHead className='font-mono text-xs uppercase tracking-wide'>
                    {t('Vendor')}
                  </TableHead>
                  <TableHead className='font-mono text-xs uppercase tracking-wide'>
                    {t('Description')}
                  </TableHead>
                  <TableHead className='w-[100px] text-end font-mono text-xs uppercase tracking-wide'>
                    {t('Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVendors.map((vendor) => {
                  const icon = vendor.icon
                    ? getLobeIcon(vendor.icon, 16)
                    : null
                  return (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <TableId value={vendor.id} />
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {icon ? (
                            <span className='border-border bg-muted flex size-7 items-center justify-center rounded-md border'>
                              {icon}
                            </span>
                          ) : null}
                          <StatusBadge
                            label={vendor.name}
                            variant='neutral'
                            size='sm'
                            copyable={false}
                          />
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground max-w-[240px] truncate text-sm'>
                        {vendor.description || '—'}
                      </TableCell>
                      <TableCell className='text-end'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            size='icon'
                            variant='outline'
                            className='size-8'
                            onClick={() => handleEdit(vendor)}
                            aria-label={t('Edit Vendor')}
                          >
                            <Pencil className='h-4 w-4' aria-hidden />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='text-destructive hover:text-destructive size-8'
                            onClick={() => setDeleteTarget(vendor)}
                            aria-label={t('Delete')}
                          >
                            <Trash2 className='h-4 w-4' aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title={t('Delete vendor')}
        desc={t(
          'Are you sure you want to delete "{{name}}"? Models linked to this vendor may need reassignment.',
          { name: deleteTarget?.name ?? '' }
        )}
        confirmText={t('Delete')}
        destructive
        isLoading={isDeleting}
        handleConfirm={() => void handleDeleteConfirm()}
      />
    </>
  )
}
