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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { cn } from '@/lib/utils'

import { Markdown } from '@/components/ui/markdown'
import { LegalDocumentBody } from './legal-document-body'
import { getPrivacyPolicy, getUserAgreement } from './api'
import { DPA_FALLBACK_MARKDOWN } from './lib/dpa-fallback'

export type LegalDocId = 'privacy' | 'terms' | 'dpa'

type LegalPageProps = {
  doc: LegalDocId
}

const DOC_META: Record<
  Exclude<LegalDocId, 'dpa'>,
  {
    titleKey: string
    queryKey: string
    fetchDocument: typeof getPrivacyPolicy
    emptyMessageKey: string
  }
> = {
  privacy: {
    titleKey: 'Privacy Policy',
    queryKey: 'privacy-policy',
    fetchDocument: getPrivacyPolicy,
    emptyMessageKey:
      'The administrator has not configured a privacy policy yet.',
  },
  terms: {
    titleKey: 'User Agreement',
    queryKey: 'user-agreement',
    fetchDocument: getUserAgreement,
    emptyMessageKey:
      'The administrator has not configured a user agreement yet.',
  },
}

export function LegalPage(props: LegalPageProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const privacyEnabled = status?.privacy_policy_enabled ?? false
  const termsEnabled = status?.user_agreement_enabled ?? false

  const tabs: { id: LegalDocId; label: string; enabled: boolean }[] = [
    { id: 'privacy', label: t('Privacy'), enabled: privacyEnabled },
    { id: 'terms', label: t('Terms'), enabled: termsEnabled },
    { id: 'dpa', label: t('DPA'), enabled: true },
  ]
  const visibleTabs = tabs.filter((tab) => tab.enabled)

  const activeMeta =
    props.doc === 'privacy' || props.doc === 'terms'
      ? DOC_META[props.doc]
      : null

  return (
    <div className='mx-auto w-full max-w-[1080px] space-y-6 px-7 py-12 md:py-14'>
      <p className='yb-eyebrow'>{t('Legal')}</p>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <h1 className='font-display text-text-strong text-3xl font-bold tracking-[-0.03em] md:text-4xl'>
          {activeMeta ? t(activeMeta.titleKey) : t('Data Processing Agreement')}
        </h1>
        <div className='bg-surface-inset border-border inline-flex rounded-full border p-1'>
          {visibleTabs.map((tab) =>
            <Link
              key={tab.id}
              to='/legal/$doc'
              params={{ doc: tab.id }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                props.doc === tab.id
                  ? 'bg-surface-2 text-text-strong shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          )}
        </div>
      </div>

      <p className='text-muted-foreground font-mono text-xs'>
        {t('Last updated from administrator configuration · effective when published')}
      </p>

      {props.doc === 'dpa' ? (
        <div className='bg-card border-border rounded-lg border px-6 py-8 md:px-10 md:py-10'>
          <Markdown withHeadingIds className='prose-neutral dark:prose-invert max-w-none font-sans'>
            {DPA_FALLBACK_MARKDOWN}
          </Markdown>
        </div>
      ) : activeMeta ? (
        <LegalDocumentBody
          queryKey={activeMeta.queryKey}
          fetchDocument={activeMeta.fetchDocument}
          emptyMessage={t(activeMeta.emptyMessageKey)}
        />
      ) : null}
    </div>
  )
}