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
import { GeneratorCard } from './components/generator-card'
import { RedemptionsDialogs } from './components/redemptions-dialogs'
import { RedemptionsProvider } from './components/redemptions-provider'
import { RedemptionsTable } from './components/redemptions-table'

/**
 * /redemption-codes (r2-B9): two-column layout — the always-visible
 * generator Panel on the left (sticky on lg+, replaces the drawer's
 * create branch), stat header + codes table on the right.
 */
export function Redemptions() {
  const { t } = useTranslation()
  return (
    <RedemptionsProvider>
      <SectionPageLayout>
        <SectionPageLayout.Content>
          <div className='mx-auto w-full max-w-[1120px] space-y-5'>
            <PageHeader
              eyebrow={t('Admin')}
              title={t('Redemption Codes')}
              subtitle={t(
                'Generate single-use codes and manage redemption batches, status, and quota value.'
              )}
            />
            <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
              <div className='w-full shrink-0 self-start lg:sticky lg:top-6 lg:w-[340px]'>
                <GeneratorCard />
              </div>
              <div className='min-w-0 flex-1'>
                <RedemptionsTable />
              </div>
            </div>
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <RedemptionsDialogs />
    </RedemptionsProvider>
  )
}
