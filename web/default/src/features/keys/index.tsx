import { useTranslation } from 'react-i18next'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import { ApiKeysDialogs } from './components/api-keys-dialogs'
import { ApiKeysPrimaryButtons } from './components/api-keys-primary-buttons'
import { ApiKeysProvider } from './components/api-keys-provider'
import { ApiKeysTable } from './components/api-keys-table'

export function ApiKeys() {
  const { t } = useTranslation()
  return (
    <ApiKeysProvider>
      <SectionPageLayout>
        <SectionPageLayout.Content>
          <div className='mx-auto w-full max-w-[1200px] space-y-5'>
            <PageHeader
              eyebrow={t('API Keys')}
              title={t('API Keys')}
              subtitle={t(
                'Issue scoped keys with per-key budgets, rate limits and model allowlists.'
              )}
              actions={<ApiKeysPrimaryButtons />}
            />
            <ApiKeysTable />
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <ApiKeysDialogs />
    </ApiKeysProvider>
  )
}
