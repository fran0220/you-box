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
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import i18next from 'i18next'
import { toast } from 'sonner'
import type { SettingsFormActionsRegistration } from '../components/settings-page-context-store'

type ContentListFormValues = {
  payload: string
}

type UseContentListSettingsFormOptions = {
  serialized: string
  baselineSerialized: string
  save: (value: string) => Promise<void>
  /** Reset in-memory list rows when the sticky bar discards. */
  onDiscard?: (baselinePayload: string) => void
}

/**
 * Bridges local list-editor state to the shared sticky save bar (VAL-SET-014+).
 * List editors keep in-memory rows; this form tracks JSON drift from the loaded baseline.
 */
export function useContentListSettingsForm(
  options: UseContentListSettingsFormOptions
) {
  const { serialized, baselineSerialized, save, onDiscard } = options

  const form = useForm<ContentListFormValues>({
    defaultValues: { payload: baselineSerialized },
  })

  const baselineRef = useRef(baselineSerialized)

  useEffect(() => {
    if (baselineRef.current === baselineSerialized) {
      return
    }
    baselineRef.current = baselineSerialized
    form.reset({ payload: baselineSerialized })
  }, [baselineSerialized, form])

  useEffect(() => {
    const current = form.getValues('payload')
    if (current === serialized) {
      return
    }
    form.setValue('payload', serialized, { shouldDirty: true })
  }, [serialized, form])

  const handleSave = useCallback(async () => {
    const next = form.getValues('payload')
    if (next === baselineRef.current) {
      toast.info(i18next.t('No changes to save'))
      return
    }
    await save(next)
    baselineRef.current = next
    form.reset({ payload: next })
  }, [form, save])

  const handleDiscard = useCallback(() => {
    const baseline = baselineRef.current
    form.reset({ payload: baseline })
    onDiscard?.(baseline)
    toast.success(i18next.t('Form reset to saved values'))
  }, [form, onDiscard])

  const registration: SettingsFormActionsRegistration = useMemo(
    () => ({
      dirty: form.formState.isDirty,
      saving: form.formState.isSubmitting,
      save: handleSave,
      discard: handleDiscard,
    }),
    [
      form.formState.isDirty,
      form.formState.isSubmitting,
      handleSave,
      handleDiscard,
    ]
  )

  return {
    form,
    registration,
    isDirty: form.formState.isDirty,
    handleSave,
    handleDiscard,
  }
}
