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
              eyebrow={`// ${t('API Keys')}`}
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
