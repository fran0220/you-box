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
