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
import { Activity, Coins, Timer, Zap } from 'lucide-react'
import {
  DeltaBadge,
  Eyebrow,
  Metric,
  Panel,
  PanelBody,
  PanelHeader,
  ProgressBar,
  Sparkline,
  StatCard,
  StatCardRow,
} from '@/components/patterns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DemoBlock, DemoRow } from '../components/demo-block'

const TREND = [42, 55, 48, 70, 62, 88, 76, 95, 84, 110, 102, 128]
const FLAT = [20, 22, 19, 21, 20, 23, 21, 22]

export default function DataDisplayDemos() {
  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock
        title='StatCard / StatCardRow'
        description='label → display value + unit → sparkline → delta; md/sm; loading'
      >
        <DemoRow label='4-up row (md)' className='block'>
          <StatCardRow columns={4}>
            <StatCard
              icon={<Activity />}
              label='Requests'
              value='1.28'
              unit='M'
              delta={{ direction: 'up', label: '+18% vs last week' }}
            />
            <StatCard
              icon={<Coins />}
              label='Spend'
              value='$247.90'
              delta={{ direction: 'up', label: '+12% vs last week' }}
            />
            <StatCard
              icon={<Zap />}
              label='Tokens'
              value='842'
              unit='M'
              sparkline={TREND}
            />
            <StatCard
              icon={<Timer />}
              label='Avg latency'
              value='0.46'
              unit='s'
              delta={{ direction: 'down', label: '−4%', tone: 'success' }}
            />
          </StatCardRow>
        </DemoRow>
        <DemoRow label='sm size' className='block'>
          <StatCardRow columns={3} className='max-w-xl'>
            <StatCard size='sm' label='Codes issued' value='1,240' />
            <StatCard size='sm' label='Active' value='382' />
            <StatCard size='sm' label='Value redeemed' value='$42.8K' />
          </StatCardRow>
        </DemoRow>
        <DemoRow label='loading / flat delta' className='block'>
          <StatCardRow columns={3} className='max-w-xl'>
            <StatCard label='Loading' value='—' loading />
            <StatCard
              label='Models served'
              value='312'
              delta={{ direction: 'flat', label: '+0' }}
            />
            <StatCard
              label='Sparkline (teal)'
              value='99.98'
              unit='%'
              sparkline={FLAT}
              sparklineColor='var(--accent)'
            />
          </StatCardRow>
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='Panel'
        description='surface card + header (eyebrow/title/actions) + body; headless'
      >
        <DemoRow label='with header + actions' className='block'>
          <Panel className='max-w-lg'>
            <PanelHeader
              eyebrow='requests over time'
              title='1.28M requests'
              actions={
                <Button variant='outline' size='sm'>
                  View all
                </Button>
              }
            />
            <PanelBody>
              <Sparkline data={TREND} height={64} />
            </PanelBody>
          </Panel>
        </DemoRow>
        <DemoRow label='headless (flush content)' className='block'>
          <Panel className='max-w-lg'>
            <PanelBody className='p-0'>
              <div className='border-divider border-b px-5 py-3 text-sm'>
                Row one
              </div>
              <div className='px-5 py-3 text-sm'>Row two</div>
            </PanelBody>
          </Panel>
        </DemoRow>
      </DemoBlock>

      <DemoBlock title='Eyebrow' description='mono uppercase brand section label'>
        <DemoRow label='default / plain'>
          <Eyebrow>balance</Eyebrow>
          <Eyebrow plain>pay with</Eyebrow>
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='Metric'
        description='k/v pair; end-aligned variant; brand accent via <b>'
      >
        <DemoRow label='start / end / accent'>
          <Metric k='Context' v='200K' />
          <Metric k='Latency' v='0.42 s' />
          <Metric
            k='Out / 1M'
            v={
              <>
                <b>$15.00</b>
              </>
            }
            align='end'
          />
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='ProgressBar'
        description='6px pill; brand/teal/semantic fills; value of max'
      >
        <DemoRow label='tones' className='max-w-md flex-col'>
          <ProgressBar value={62} label='brand' />
          <ProgressBar value={74} tone='teal' label='teal' />
          <ProgressBar value={92} tone='success' label='success' />
          <ProgressBar value={48} tone='warning' label='warning' />
          <ProgressBar value={15} tone='danger' label='danger' />
        </DemoRow>
        <DemoRow label='value of max (182.4 of 300)' className='max-w-md flex-col'>
          <ProgressBar value={182.4} max={300} label='spend of limit' />
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='Sparkline'
        description='area microchart; fill toggle; custom color'
      >
        <DemoRow label='brand fill / teal line-only / danger' className='max-w-2xl'>
          <div className='w-40'>
            <Sparkline data={TREND} />
          </div>
          <div className='w-40'>
            <Sparkline data={FLAT} color='var(--accent)' fill={false} />
          </div>
          <div className='w-40'>
            <Sparkline data={[20, 18, 22, 8, 4, 2, 3]} color='var(--danger)' />
          </div>
        </DemoRow>
      </DemoBlock>

      <DemoBlock
        title='DeltaBadge'
        description='direction-colored trend; tone override for inverted metrics'
      >
        <DemoRow label='up / down / flat / latency-down-is-good'>
          <DeltaBadge direction='up'>+18% vs last week</DeltaBadge>
          <DeltaBadge direction='down'>−12%</DeltaBadge>
          <DeltaBadge direction='flat'>+0</DeltaBadge>
          <DeltaBadge direction='down' tone='success'>
            −4% latency
          </DeltaBadge>
        </DemoRow>
        <DemoRow label='inside badge context'>
          <Badge variant='secondary'>
            7d <DeltaBadge direction='up' className='text-[10px]'>+9%</DeltaBadge>
          </Badge>
        </DemoRow>
      </DemoBlock>
    </div>
  )
}
