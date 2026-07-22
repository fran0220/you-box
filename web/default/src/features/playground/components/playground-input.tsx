import { useState, type ReactNode } from 'react'
import {
  ArrowUpIcon,
  BrainIcon,
  GlobeIcon,
  ImageIcon,
  LinkIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuItem,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ReasoningEffort } from '../types'

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
  /** Claude-style model chip rendered in the footer, next to send. */
  modelSelector?: ReactNode
}

// Max size for an uploaded (base64-inlined) image.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const REASONING_LEVELS: Array<{
  value: ReasoningEffort
  labelKey: string
}> = [
  { value: 'off', labelKey: 'Off' },
  { value: 'low', labelKey: 'Low' },
  { value: 'medium', labelKey: 'Medium' },
  { value: 'high', labelKey: 'High' },
]

/**
 * PlaygroundInput — the Claude-style composer: one rounded card with the
 * textarea on top and a single tools row below (attach menu + web search +
 * reasoning on the left, model chip + round send button on the right).
 */
export function PlaygroundInput(props: PlaygroundInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  const webSearch = props.webSearch ?? false
  const reasoningEffort = props.reasoningEffort ?? 'off'
  // The advanced sheet may set 'minimal'; surface it as Low in the chip.
  const reasoningDisplay: ReasoningEffort =
    reasoningEffort === 'minimal' ? 'low' : reasoningEffort
  const reasoningActive = reasoningDisplay !== 'off'
  const reasoningLabelKey =
    REASONING_LEVELS.find((level) => level.value === reasoningDisplay)
      ?.labelKey ?? 'Off'

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() || props.disabled) return
    const pasted = (message.files ?? [])
      .filter((file) => file.mediaType?.startsWith('image/') && file.url)
      .map((file) => file.url as string)
    const urls = imageUrls.filter((url) => url.trim() !== '')
    const allImages = [...pasted, ...urls]
    props.onSubmit(message.text, allImages.length > 0 ? allImages : undefined)
    setText('')
    setImageUrls([])
  }

  const handleAddUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    setImageUrls((urls) => [...urls, url])
    setUrlDraft('')
    setUrlDialogOpen(false)
  }

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls((urls) => urls.filter((_, i) => i !== index))
  }

  return (
    <>
      <PromptInput
        groupClassName='rounded-xl'
        accept='image/*'
        multiple
        maxFileSize={MAX_IMAGE_BYTES}
        onError={(err) => {
          if (err.code === 'max_file_size') {
            toast.error(t('Image is too large (max 10MB)'))
            return
          }
          toast.error(t('Only image files are supported'))
        }}
        onSubmit={handleSubmit}
      >
        <PromptInputHeader className='gap-1.5 empty:hidden'>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          {imageUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className='group border-border relative h-14 w-14 overflow-hidden rounded-md border'
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
          ))}
        </PromptInputHeader>

        <PromptInputTextarea
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          className='px-4 md:text-base'
          disabled={props.disabled}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('Send a message…')}
          value={text}
        />

        <PromptInputFooter className='p-2'>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger
                aria-label={t('Attach')}
                title={t('Attach')}
                disabled={props.disabled}
              />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments label={t('Upload image')} />
                <PromptInputActionMenuItem
                  onClick={() => setUrlDialogOpen(true)}
                >
                  <LinkIcon className='mr-2 size-4' />
                  {t('Add image URL')}
                </PromptInputActionMenuItem>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>

            <PromptInputButton
              disabled={props.disabled}
              onClick={() => props.onWebSearchChange?.(!webSearch)}
              aria-pressed={webSearch}
              aria-label={t('Search')}
              title={t('Web search')}
              className={cn(
                webSearch &&
                  'bg-brand-subtle text-brand hover:bg-brand-subtle hover:text-brand'
              )}
            >
              <GlobeIcon size={16} />
            </PromptInputButton>

            {props.showReasoningEffort && props.onReasoningEffortChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <PromptInputButton
                      disabled={props.disabled}
                      size={reasoningActive ? 'sm' : 'icon-sm'}
                      aria-label={t('Reasoning effort')}
                      title={t('Reasoning effort')}
                      className={cn(
                        reasoningActive &&
                          'bg-brand-subtle text-brand hover:bg-brand-subtle hover:text-brand'
                      )}
                    />
                  }
                >
                  <BrainIcon size={16} />
                  {reasoningActive && (
                    <span className='text-xs'>{t(reasoningLabelKey)}</span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-36'>
                  <DropdownMenuRadioGroup
                    value={reasoningDisplay}
                    onValueChange={(value) =>
                      props.onReasoningEffortChange?.(value as ReasoningEffort)
                    }
                  >
                    {REASONING_LEVELS.map((level) => (
                      <DropdownMenuRadioItem
                        key={level.value}
                        value={level.value}
                      >
                        {t(level.labelKey)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </PromptInputTools>

          <div className='flex min-w-0 items-center gap-1.5'>
            {props.modelSelector}
            {props.isGenerating && props.onStop ? (
              <PromptInputButton
                variant='secondary'
                size='icon-sm'
                className='rounded-full'
                onClick={props.onStop}
                aria-label={t('Stop')}
                title={t('Stop')}
              >
                <SquareIcon className='fill-current' size={14} />
              </PromptInputButton>
            ) : (
              <PromptInputButton
                variant='default'
                size='icon-sm'
                className='rounded-full'
                disabled={props.disabled || !text.trim()}
                type='submit'
                aria-label={t('Send message')}
                title={t('Send message')}
              >
                <ArrowUpIcon size={16} />
              </PromptInputButton>
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>

      <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>{t('Add image URL')}</DialogTitle>
            <DialogDescription>
              {t('Attach an image by pasting a direct link.')}
            </DialogDescription>
          </DialogHeader>
          <div className='flex items-center gap-2'>
            <ImageIcon size={16} className='text-muted-foreground shrink-0' />
            <Input
              autoFocus
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              placeholder={t('https://example.com/image.png')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddUrl()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setUrlDialogOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button onClick={handleAddUrl} disabled={!urlDraft.trim()}>
              {t('Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
