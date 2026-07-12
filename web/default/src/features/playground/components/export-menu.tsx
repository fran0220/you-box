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
import { Download, FileJson, FileText, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  buildCopyAsCurl,
  downloadTextFile,
  exportConversationJson,
  exportConversationMarkdown,
} from '../lib/export'
import type { Message, ParameterEnabled, PlaygroundConfig } from '../types'

interface ExportMenuProps {
  messages: Message[]
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  disabled?: boolean
}

export function ExportMenu({
  messages,
  config,
  parameterEnabled,
  disabled,
}: ExportMenuProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon-sm'
            disabled={disabled || messages.length === 0}
            aria-label={t('Export')}
            title={t('Export')}
          />
        }
      >
        <Download className='size-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => {
            downloadTextFile(
              'conversation.md',
              exportConversationMarkdown(messages),
              'text/markdown;charset=utf-8'
            )
            toast.success(t('Exported Markdown'))
          }}
        >
          <FileText className='size-4' />
          {t('Export Markdown')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            downloadTextFile(
              'conversation.json',
              exportConversationJson(messages, config),
              'application/json'
            )
            toast.success(t('Exported JSON'))
          }}
        >
          <FileJson className='size-4' />
          {t('Export JSON')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            const curl = buildCopyAsCurl(messages, config, parameterEnabled)
            try {
              await navigator.clipboard.writeText(curl)
              toast.success(t('cURL copied to clipboard'))
            } catch {
              toast.error(t('Failed to copy'))
            }
          }}
        >
          <Terminal className='size-4' />
          {t('Copy as cURL')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
