import { useState } from 'react'
import { Activity, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '@/components/settings'
import {
  CodeBlock,
  EmptyState,
  Eyebrow,
  ModelCard,
  PageHeader,
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
  SettingsSection,
  StatCard,
  StatCardRow,
} from '@/components/youbox'
import { DemoBlock, DemoRow } from '../components/demo-block'

const SNIPPET = `export const ok = true`

export default function YouboxCompositionsDemos() {
  const { t } = useTranslation()
  const [range, setRange] = useState('7d')

  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock
        title='youbox/* compositions'
        description='Canonical monochrome compositions (single implementation; patterns/* re-exports)'
      >
        <DemoRow label='Eyebrow'>
          <Eyebrow data-design-lab='youbox-eyebrow'>overview</Eyebrow>
        </DemoRow>
        <DemoRow label='PageHeader' className='block'>
          <PageHeader
            data-design-lab='youbox-page-header'
            eyebrow='dashboard'
            title='Usage overview'
            subtitle='Requests, spend, and latency for the selected period.'
            actions={
              <Button size='sm' variant='secondary'>
                Export
              </Button>
            }
          />
        </DemoRow>
        <DemoRow label='StatCard' className='block'>
          <StatCardRow columns={2} className='max-w-xl' data-design-lab='youbox-stat-card'>
            <StatCard
              icon={<Activity />}
              label='Requests'
              value='1.28'
              unit='M'
              delta={{ direction: 'up', label: '+18%' }}
            />
            <StatCard
              label='Errors'
              value='0.02'
              unit='%'
              delta={{ direction: 'down', label: '−4%' }}
            />
          </StatCardRow>
        </DemoRow>
        <DemoRow label='SettingsSection' className='block'>
          <SettingsSection
            data-design-lab='youbox-settings-section'
            title='General'
            description='Workspace-wide defaults.'
            footer={<Button size='sm'>{t('Save')}</Button>}
            className='max-w-xl'
          >
            <SettingRow
              label='Allow registrations'
              description='New users can sign up without an invite.'
              control={<Switch defaultChecked />}
            />
            <SettingRow
              label='Invite only'
              description='Require an invite code at sign-up.'
              control={<Switch />}
            />
          </SettingsSection>
        </DemoRow>
        <DemoRow label='EmptyState' className='block'>
          <div className='max-w-md rounded-lg border'>
            <EmptyState
              data-design-lab='youbox-empty-state'
              icon={SearchX}
              title={t('No models found')}
              description={t('No models match your current filters.')}
              action={<Button size='sm'>{t('Clear all filters')}</Button>}
            />
          </div>
        </DemoRow>
        <DemoRow label='ModelCard' className='block'>
          <ModelCard
            data-design-lab='youbox-model-card'
            className='max-w-md'
            name='claude-opus-4'
            author='by Anthropic'
            description='Strong reasoning and long-context tasks.'
            badge={<Badge variant='secondary'>New</Badge>}
            avatarFallback='C'
            tags={['vision', 'tools']}
            metrics={[
              { key: 'Context', value: '200K' },
              { key: 'Latency', value: '0.42 s' },
            ]}
          />
        </DemoRow>
        <DemoRow label='CodeBlock' className='block'>
          <CodeBlock
            data-design-lab='youbox-code-block'
            className='max-w-xl'
            code={SNIPPET}
            language='typescript'
            title='example.ts'
          />
        </DemoRow>
        <DemoRow label='SegmentedTabs (pill)'>
          <SegmentedTabs
            data-design-lab='youbox-segmented-tabs'
            value={range}
            onValueChange={setRange}
          >
            <SegmentedTabsList>
              <SegmentedTabsTrigger value='24h'>24h</SegmentedTabsTrigger>
              <SegmentedTabsTrigger value='7d'>7d</SegmentedTabsTrigger>
              <SegmentedTabsTrigger value='30d'>30d</SegmentedTabsTrigger>
            </SegmentedTabsList>
            <SegmentedTabsContent
              value={range}
              className='text-muted-foreground text-sm'
            >
              Active: {range}
            </SegmentedTabsContent>
          </SegmentedTabs>
        </DemoRow>
      </DemoBlock>
    </div>
  )
}
