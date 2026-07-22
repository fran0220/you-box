import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * A single checklist gate item. All items must be checked before the confirm
 * button is enabled.
 */
export type ConfirmDialogChecklistItem = {
  id: string
  label: React.ReactNode
}

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  disabled?: boolean
  desc: React.ReactNode
  cancelBtnText?: string
  confirmText?: React.ReactNode
  destructive?: boolean
  handleConfirm: () => void
  isLoading?: boolean
  className?: string
  /** Optional class override for the header (e.g. when the content sets its own padding). */
  headerClassName?: string
  /** Optional class override for the description. */
  descClassName?: string
  /** Optional class override for the footer (e.g. when the content sets its own padding). */
  footerClassName?: string
  children?: React.ReactNode
  /**
   * When set, the user must type this exact string (trimmed) before the confirm
   * button is enabled. Renders a labelled input with copy/paste disabled. Use
   * for high-risk destructive actions (e.g. a resource name or "DELETE").
   */
  requireTypedText?: string
  /** Optional label shown above the typed-text input. */
  typedTextPrompt?: React.ReactNode
  /** Optional placeholder for the typed-text input. */
  typedTextPlaceholder?: string
  /** Optional hint shown when the typed text does not match. */
  typedTextMismatchHint?: React.ReactNode
  /**
   * When set, renders a checklist. Every item must be checked before the
   * confirm button is enabled.
   */
  checklist?: ConfirmDialogChecklistItem[]
  /**
   * Label shown on the confirm button while `isLoading` is true. Standardizes
   * the busy state (e.g. "Deleting…"). Falls back to `confirmText`.
   */
  busyLabel?: React.ReactNode
  /**
   * Escape hatch for wrappers (e.g. RiskAcknowledgementDialog) that contribute
   * additional gate conditions while still funneling through this single
   * confirm implementation. When `false`, the confirm button stays disabled
   * even if the built-in gates pass. Defaults to `true`.
   */
  extraGatePassed?: boolean
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { t } = useTranslation()
  const {
    open,
    title,
    desc,
    children,
    className,
    confirmText,
    cancelBtnText,
    destructive,
    isLoading,
    disabled = false,
    handleConfirm,
    headerClassName,
    descClassName,
    footerClassName,
    requireTypedText,
    typedTextPrompt,
    typedTextPlaceholder,
    typedTextMismatchHint,
    checklist,
    busyLabel,
    extraGatePassed = true,
    onOpenChange,
  } = props

  const checklistItems = useMemo(() => checklist ?? [], [checklist])
  const hasChecklist = checklistItems.length > 0
  const trimmedRequiredText = requireTypedText?.trim() ?? ''
  const hasRequiredText = trimmedRequiredText.length > 0

  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set())
  const [typedText, setTypedText] = useState('')

  // Reset gate state whenever the dialog (re)opens or its gate config changes,
  // so a re-used dialog never leaks a previously-satisfied gate.
  const resetKey = `${open}|${checklistItems.map((item) => item.id).join(',')}|${trimmedRequiredText}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey)
    if (open) {
      setCheckedIds(new Set())
      setTypedText('')
    }
  }

  const allChecked = useMemo(() => {
    if (!hasChecklist) return true
    return checklistItems.every((item) => checkedIds.has(item.id))
  }, [hasChecklist, checklistItems, checkedIds])

  const typedMatched = !hasRequiredText || typedText.trim() === trimmedRequiredText
  const hasTypedSomething = typedText.length > 0
  const gatesPassed = allChecked && typedMatched && extraGatePassed

  const toggleChecked = (id: string, checked: boolean) => {
    setCheckedIds((previous) => {
      const next = new Set(previous)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const confirmDisabled = disabled || isLoading || !gatesPassed
  const confirmLabel = confirmText ?? t('Continue')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(className && className)}>
        <AlertDialogHeader className={cn('text-start', headerClassName)}>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {desc ? (
            <AlertDialogDescription render={<div />} className={descClassName}>
              {desc}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {children}
        {hasChecklist ? (
          <div className='border-border/70 bg-muted/30 space-y-3 rounded-lg border p-3 sm:p-4'>
            {checklistItems.map((item) => {
              const checkboxId = `confirm-checklist-${item.id}`
              return (
                <div key={item.id} className='flex items-start gap-3'>
                  <Checkbox
                    id={checkboxId}
                    checked={checkedIds.has(item.id)}
                    onCheckedChange={(checked) =>
                      toggleChecked(item.id, checked === true)
                    }
                    className='mt-0.5'
                  />
                  <Label
                    htmlFor={checkboxId}
                    className='text-muted-foreground text-sm leading-5 font-normal'
                  >
                    {item.label}
                  </Label>
                </div>
              )
            })}
          </div>
        ) : null}
        {hasRequiredText ? (
          <div className='border-destructive/30 bg-destructive/5 space-y-3 rounded-lg border p-3 sm:p-4'>
            <Label className='text-sm font-medium'>
              {typedTextPrompt ??
                t('Please type the following text to confirm:')}
            </Label>
            <div className='bg-background border-border rounded-md border px-3 py-2 font-mono text-sm break-all'>
              {trimmedRequiredText}
            </div>
            <Input
              value={typedText}
              onChange={(event) => setTypedText(event.target.value)}
              placeholder={
                typedTextPlaceholder ?? t('Type the confirmation text here')
              }
              autoFocus={open}
              onCopy={(event) => event.preventDefault()}
              onCut={(event) => event.preventDefault()}
              onPaste={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()}
              aria-invalid={hasTypedSomething && !typedMatched}
              className='font-mono'
            />
            {hasTypedSomething && !typedMatched ? (
              <p className='text-destructive text-xs'>
                {typedTextMismatchHint ??
                  t('The entered text does not match the required text.')}
              </p>
            ) : null}
          </div>
        ) : null}
        <AlertDialogFooter className={footerClassName}>
          <AlertDialogCancel disabled={isLoading}>
            {cancelBtnText ?? t('Cancel')}
          </AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={confirmDisabled}
          >
            {isLoading ? (busyLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
