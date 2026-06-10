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
import { useState } from 'react'
import {
  AlertTriangle,
  CreditCard,
  Download,
  ServerCrash,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  FilterChips,
  InlineAlert,
  InvoiceRow,
  NotificationGroup,
  NotificationItem,
  Panel,
  PlanCard,
  SecretReveal,
  StepIndicator,
  TransactionRow,
} from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { StatusBadge, statusVariantFor } from '@/components/status-badge'
import { DemoBlock, DemoRow } from '../components/demo-block'

export default function FeedbackDemos() {
  const [filter, setFilter] = useState('all')
  const [step, setStep] = useState(1)

  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock
        title='InlineAlert'
        description='semantic subtle panels; title + body + actions slot; new-key composition'
      >
        <div className='flex max-w-2xl flex-col gap-3'>
          <InlineAlert tone='success' title='Valid code'>
            $50.00 will be added to your balance.
          </InlineAlert>
          <InlineAlert tone='warning' title='Budget threshold reached'>
            Key “Production” has used 80% of its monthly budget.
          </InlineAlert>
          <InlineAlert tone='danger' title='Provider degraded'>
            Together AI returned elevated errors.
          </InlineAlert>
          <InlineAlert tone='info'>Plain info body without a title.</InlineAlert>
          <InlineAlert
            tone='brand'
            title='New key created — copy it now'
            actions={<Button size='sm'>Done</Button>}
          >
            <span className='mb-2 block'>
              For security, the full secret is shown only once.
            </span>
            <SecretReveal
              value='yb-live-9f2a8c1d4e7b2a90f3c71'
              defaultRevealed
              className='max-w-sm'
            />
          </InlineAlert>
        </div>
      </DemoBlock>

      <DemoBlock
        title='SecretReveal'
        description='masked / revealed / no-toggle; copy with feedback'
      >
        <div className='flex max-w-sm flex-col gap-3'>
          <SecretReveal value='yb-live-9f2a8c1d4e7b2a90f3c71' />
          <SecretReveal value='yb-live-9f2a8c1d4e7b2a90f3c71' defaultRevealed />
          <SecretReveal
            value='yb-live-9f2a8c1d4e7b2a90f3c71'
            hideToggle
            masked='yb-live-••••3c71'
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title='StatusBadge appearances + vocabulary'
        description="text (legacy) / soft / solid; statusVariantFor maps 200·429·500, Active·Limited·Revoked, Operational·Degraded·Down"
      >
        <DemoRow label='soft — http codes'>
          {['200', '429', '500'].map((code) => (
            <StatusBadge
              key={code}
              appearance='soft'
              variant={statusVariantFor(code)}
              label={code}
              copyable={false}
            />
          ))}
        </DemoRow>
        <DemoRow label='soft — key & provider states'>
          {['Active', 'Limited', 'Revoked', 'Operational', 'Degraded', 'Down'].map(
            (term) => (
              <StatusBadge
                key={term}
                appearance='soft'
                variant={statusVariantFor(term)}
                label={term}
                copyable={false}
              />
            )
          )}
        </DemoRow>
        <DemoRow label='solid / text(legacy)'>
          <StatusBadge appearance='solid' variant='success' label='Paid' copyable={false} />
          <StatusBadge appearance='solid' variant='danger' label='Down' copyable={false} />
          <StatusBadge variant='success' label='Active' copyable={false} />
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='StepIndicator'
        description='done / active / pending with connectors; click to advance'
      >
        <div className='w-full max-w-xl'>
          <StepIndicator
            steps={[{ label: 'Database' }, { label: 'Admin account' }, { label: 'Site config' }]}
            current={step}
          />
          <Button
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={() => setStep((s) => (s + 1) % 4)}
          >
            Advance step ({step})
          </Button>
        </div>
      </DemoBlock>

      <DemoBlock
        title='NotificationItem / NotificationGroup / FilterChips'
        description='semantic icon tiles, unread surface + dot, mono time, date groups, pill filters with counts'
        bleed
      >
        <div className='p-4'>
          <FilterChips
            label='Notification filters'
            value={filter}
            onValueChange={setFilter}
            items={[
              { value: 'all', label: 'All', count: 12 },
              { value: 'unread', label: 'Unread', count: 3 },
              { value: 'billing', label: 'Billing' },
              { value: 'system', label: 'System' },
            ]}
            className='mb-4'
          />
          <Panel>
            <NotificationGroup label='today'>
              <NotificationItem
                tone='warning'
                icon={<AlertTriangle />}
                title='Budget threshold reached'
                body='Key “Production” has used 80% of its $300 monthly budget.'
                time='12m'
                unread
              />
              <NotificationItem
                tone='brand'
                icon={<Zap />}
                title='New model available'
                body='Qwen 3 Max is now routable.'
                time='1h'
                unread
              />
              <NotificationItem
                tone='success'
                icon={<TrendingUp />}
                title='Spend down 12%'
                body='Weekly inference spend dropped vs last week.'
                time='3h'
              />
            </NotificationGroup>
            <NotificationGroup label='earlier'>
              <NotificationItem
                tone='accent'
                icon={<CreditCard />}
                title='Top-up successful'
                body='$100.00 was added to your balance.'
                time='2d'
              />
              <NotificationItem
                tone='danger'
                icon={<ServerCrash />}
                title='Provider degraded'
                body='Traffic was auto-routed to healthy providers.'
                time='3d'
              />
            </NotificationGroup>
          </Panel>
        </div>
      </DemoBlock>

      <DemoBlock
        title='PlanCard'
        description='current (brand) vs choosable'
      >
        <div className='flex w-full max-w-md flex-col gap-2.5'>
          <PlanCard
            name='Free'
            price='$0'
            description='Pass-through pricing'
            action={
              <Button variant='outline' size='sm'>
                Choose
              </Button>
            }
          />
          <PlanCard name='Pro' price='$20' unit='/ mo' description='Current plan' current />
          <PlanCard
            name='Enterprise'
            price='Custom'
            description='Dedicated capacity'
            action={
              <Button variant='outline' size='sm'>
                Choose
              </Button>
            }
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title='TransactionRow / InvoiceRow'
        description='direction-colored amounts; invoice with status + download'
        bleed
      >
        <div className='grid gap-4 p-4 lg:grid-cols-2'>
          <Panel>
            <TransactionRow
              title='Top-up · Visa ••42'
              sub='Jun 6'
              amount='+$100.00'
              direction='in'
            />
            <TransactionRow
              title='Usage · 7 days'
              sub='Jun 1–7'
              amount='−$54.20'
              direction='out'
            />
            <TransactionRow
              title='Promo credit'
              sub='May 20'
              amount='+$5.00'
              direction='in'
            />
          </Panel>
          <Panel>
            <InvoiceRow
              title='Jun 2026'
              sub='Pro + usage'
              amount='$74.20'
              status={
                <StatusBadge
                  appearance='soft'
                  variant='success'
                  label='Paid'
                  copyable={false}
                />
              }
              action={
                <Button variant='ghost' size='icon-xs' aria-label='Download'>
                  <Download />
                </Button>
              }
            />
            <InvoiceRow
              title='May 2026'
              sub='Pro + usage'
              amount='$68.90'
              status={
                <StatusBadge
                  appearance='soft'
                  variant='success'
                  label='Paid'
                  copyable={false}
                />
              }
            />
          </Panel>
        </div>
      </DemoBlock>
    </div>
  )
}
