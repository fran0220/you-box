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
import { useMemo, useRef, useState } from 'react'
import {
  PaperclipIcon,
  UploadIcon,
  ImageIcon,
  GlobeIcon,
  SendIcon,
  SquareIcon,
  XIcon,
  BarChartIcon,
  BoxIcon,
  NotepadTextIcon,
  CodeSquareIcon,
  GraduationCapIcon,
} from 'lucide-react'
import type { ReasoningEffort } from '../types'
import { ReasoningEffortControl } from './reasoning-effort-control'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'

interface PlaygroundInputProps {
  onSubmit: (text: string, imageUrls?: string[]) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  /** Native web search toggle state + setter (wired to config.webSearch). */
  webSearch?: boolean
  onWebSearchChange?: (value: boolean) => void
  /** Show product reasoning intensity control when the model supports it. */
  showReasoningEffort?: boolean
  reasoningEffort?: ReasoningEffort
  onReasoningEffortChange?: (value: ReasoningEffort) => void
}

const isMacPlatform = () =>
  typeof navigator !== 'undefined' &&
  /mac/i.test(navigator.platform || navigator.userAgent)

// Max size for an uploaded (base64-inlined) image.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function PlaygroundInput({
  onSubmit,
  onStop,
  disabled,
  isGenerating,
  webSearch = false,
  onWebSearchChange,
  showReasoningEffort = false,
  reasoningEffort = 'off',
  onReasoningEffortChange,
}: PlaygroundInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isMac = isMacPlatform()

  const suggestions = useMemo(
    () => [
      {
        icon: BarChartIcon,
        textKey: 'Analyze data' as const,
        color: 'var(--brand)',
      },
      {
        icon: BoxIcon,
        textKey: 'Surprise me' as const,
        color: 'var(--text-muted)',
      },
      {
        icon: NotepadTextIcon,
        textKey: 'Summarize text' as const,
        color: 'var(--text-muted)',
      },
      { icon: CodeSquareIcon, textKey: 'Code' as const, color: 'var(--brand)' },
      {
        icon: GraduationCapIcon,
        textKey: 'Get advice' as const,
        color: 'var(--text-muted)',
      },
      { icon: null, textKey: 'More' as const, color: undefined },
    ],
    []
  )

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() || disabled) return
    const validImages = imageUrls.filter((url) => url.trim() !== '')
    onSubmit(message.text, validImages.length > 0 ? validImages : undefined)
    setText('')
    setImageUrls([])
  }

  const handleAddImageUrl = () => {
    setImageUrls((urls) => [...urls, ''])
  }

  const handleUpdateImageUrl = (index: number, value: string) => {
    setImageUrls((urls) => urls.map((url, i) => (i === index ? value : url)))
  }

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls((urls) => urls.filter((_, i) => i !== index))
  }

  const handlePickFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return
    const dataUrls: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('Only image files are supported'))
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(t('Image is too large (max 10MB)'))
        continue
      }
      try {
        dataUrls.push(await readFileAsDataUrl(file))
      } catch {
        toast.error(t('Failed to read image'))
      }
    }
    if (dataUrls.length) {
      setImageUrls((urls) => [...urls, ...dataUrls])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion)
  }

  return (
    <div className='grid shrink-0 gap-4 px-1 md:pb-4'>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple
        className='hidden'
        onChange={(event) => void handleFilesSelected(event.target.files)}
      />
      <PromptInput groupClassName='rounded-xl' onSubmit={handleSubmit}>
        <PromptInputTextarea
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          className='px-5 md:text-base'
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('Send a message…')}
          value={text}
        />

        {imageUrls.length > 0 && (
          <div className='flex flex-wrap gap-2 px-3 pb-1'>
            {imageUrls.map((url, index) => {
              const isData = url.startsWith('data:')
              if (isData) {
                // Uploaded image → thumbnail chip (data URLs are too long to edit).
                return (
                  <div
                    key={index}
                    className='group relative h-16 w-16 overflow-hidden rounded-md border'
                  >
                    <img
                      src={url}
                      alt={t('Attached image')}
                      className='h-full w-full object-cover'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveImageUrl(index)}
                      aria-label={t('Remove image URL')}
                      className='bg-background/80 absolute top-0.5 right-0.5 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100'
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                )
              }
              // URL entry → editable text field.
              return (
                <div key={index} className='flex w-full items-center gap-1.5'>
                  <ImageIcon
                    size={14}
                    className='text-muted-foreground shrink-0'
                  />
                  <Input
                    value={url}
                    onChange={(event) =>
                      handleUpdateImageUrl(index, event.target.value)
                    }
                    placeholder={t('https://example.com/image.png')}
                    className='h-7 flex-1 text-xs'
                    disabled={disabled}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 shrink-0'
                    onClick={() => handleRemoveImageUrl(index)}
                    aria-label={t('Remove image URL')}
                  >
                    <XIcon size={14} />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <PromptInputFooter className='p-2.5'>
          <PromptInputTools>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <PromptInputButton
                    className='border font-medium'
                    disabled={disabled}
                    variant='outline'
                  />
                }
              >
                <PaperclipIcon size={16} />
                <span className='hidden sm:inline'>{t('Attach')}</span>
                <span className='sr-only sm:hidden'>{t('Attach')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={handlePickFiles}>
                  <UploadIcon className='mr-2' size={16} />
                  {t('Upload image')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddImageUrl}>
                  <ImageIcon className='mr-2' size={16} />
                  {t('Add image URL')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <PromptInputButton
              className={cn(
                'border font-medium',
                webSearch && 'border-brand-border'
              )}
              disabled={disabled}
              onClick={() => onWebSearchChange?.(!webSearch)}
              variant={webSearch ? 'default' : 'outline'}
              aria-pressed={webSearch}
            >
              <GlobeIcon size={16} />
              <span className='hidden sm:inline'>{t('Search')}</span>
              <span className='sr-only sm:hidden'>{t('Search')}</span>
            </PromptInputButton>

            {showReasoningEffort && onReasoningEffortChange ? (
              <ReasoningEffortControl
                value={reasoningEffort}
                onChange={onReasoningEffortChange}
                disabled={disabled}
              />
            ) : null}
          </PromptInputTools>

          <div className='flex items-center gap-1.5 md:gap-2'>
            {/* Enter and mod+Enter both submit (Shift+Enter inserts a newline) */}
            <span className='text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex'>
              <KbdGroup>
                <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                <Kbd>↵</Kbd>
              </KbdGroup>
              {t('to send')}
            </span>

            {isGenerating && onStop ? (
              <PromptInputButton
                className='text-foreground font-medium'
                onClick={onStop}
                variant='secondary'
              >
                <SquareIcon className='fill-current' size={16} />
                <span className='hidden sm:inline'>{t('Stop')}</span>
                <span className='sr-only sm:hidden'>{t('Stop')}</span>
              </PromptInputButton>
            ) : (
              <PromptInputButton
                className='text-foreground font-medium'
                disabled={disabled || !text.trim()}
                type='submit'
                variant='secondary'
              >
                <SendIcon size={16} />
                <span className='hidden sm:inline'>{t('Send')}</span>
                <span className='sr-only sm:hidden'>{t('Send')}</span>
              </PromptInputButton>
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>

      <Suggestions>
        {suggestions.map(({ icon: Icon, textKey, color }) => {
          const label = t(textKey)
          return (
            <Suggestion
              className={cn(
                'text-xs font-normal sm:text-sm',
                textKey === 'More' && 'hidden sm:flex'
              )}
              key={textKey}
              onClick={() => handleSuggestionClick(label)}
              suggestion={label}
            >
              {Icon && color ? (
                <Icon size={16} style={{ color }} />
              ) : Icon ? (
                <Icon size={16} className='text-muted-foreground' />
              ) : null}
              {label}
            </Suggestion>
          )
        })}
      </Suggestions>
    </div>
  )
}
