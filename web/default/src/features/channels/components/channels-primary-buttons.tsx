import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  MoreHorizontal,
  Settings2,
  Trash2,
  Tags,
  TestTube,
  DollarSign,
  SortAsc,
  RefreshCw,
  ArrowUpFromLine,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  handleDeleteAllDisabled,
  handleFixAbilities,
  handleTestAllChannels,
  handleUpdateAllBalances,
} from '../lib'
import { useChannels } from './channels-provider'

/**
 * Page-level actions for /channels (r2-B7 §1).
 *
 * Add channel (primary) and Test all (outline) are directly visible; the
 * remaining maintenance operations (tag mode, ID sort, balances, upstream
 * updates, fix abilities, delete disabled) live in the More dropdown —
 * every action is preserved, only the hierarchy changed.
 */
export function ChannelsPrimaryButtons() {
  const { t } = useTranslation()
  const {
    setOpen,
    setCurrentRow,
    enableTagMode,
    setEnableTagMode,
    idSort,
    setIdSort,
    upstream,
  } = useChannels()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleTagModeToggle = (checked: boolean) => {
    localStorage.setItem('enable-tag-mode', String(checked))
    setEnableTagMode(checked)
  }

  const handleIdSortToggle = (checked: boolean) => {
    localStorage.setItem('channels-id-sort', String(checked))
    setIdSort(checked)
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        {/* Test all channels — directly visible */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            handleTestAllChannels(queryClient)
          }}
        >
          <TestTube className='h-4 w-4' />
          <span className='max-sm:hidden'>{t('Test All Channels')}</span>
          <span className='sm:hidden'>{t('Test all')}</span>
        </Button>

        {/* Add channel — primary */}
        <Button
          onClick={() => {
            setCurrentRow(null)
            setOpen('create-channel')
          }}
          size='sm'
        >
          <Plus className='h-4 w-4' />
          <span className='max-sm:hidden'>{t('Add Channel')}</span>
          <span className='sm:hidden'>{t('Add')}</span>
        </Button>

        {/* More — bulk maintenance actions */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='outline'
                size='sm'
                aria-label={t('More actions')}
              />
            }
          >
            <MoreHorizontal className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuCheckboxItem
              checked={enableTagMode}
              onCheckedChange={handleTagModeToggle}
            >
              <Tags className='mr-2 h-4 w-4' />
              {t('Tag Mode')}
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={idSort}
              onCheckedChange={handleIdSortToggle}
            >
              <SortAsc className='mr-2 h-4 w-4' />
              {t('Sort by ID')}
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                handleUpdateAllBalances(queryClient)
              }}
            >
              {t('Update All Balances')}
              <DropdownMenuShortcut>
                <DollarSign className='h-4 w-4' />
              </DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => upstream.detectAllUpdates()}
              disabled={upstream.detectAllLoading}
            >
              {t('Detect All Upstream Updates')}
              <DropdownMenuShortcut>
                <RefreshCw className='h-4 w-4' />
              </DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => upstream.applyAllUpdates()}
              disabled={upstream.applyAllLoading}
            >
              {t('Apply All Upstream Updates')}
              <DropdownMenuShortcut>
                <ArrowUpFromLine className='h-4 w-4' />
              </DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                handleFixAbilities(queryClient)
              }}
            >
              {t('Fix Abilities')}
              <DropdownMenuShortcut>
                <Settings2 className='h-4 w-4' />
              </DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setShowDeleteDialog(true)
              }}
              className='text-destructive focus:text-destructive'
            >
              {t('Delete All Disabled')}
              <DropdownMenuShortcut>
                <Trash2 className='h-4 w-4' />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('Delete All Disabled Channels?')}
        desc={t(
          'This will permanently delete all manually and automatically disabled channels. This action cannot be undone.'
        )}
        destructive
        handleConfirm={() => {
          handleDeleteAllDisabled(queryClient)
          setShowDeleteDialog(false)
        }}
      />
    </>
  )
}
