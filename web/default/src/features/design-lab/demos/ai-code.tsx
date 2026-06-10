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
import { ChevronDown, RotateCcw, Share2, Zap } from 'lucide-react'
import { CodeBlock } from '@/components/ai-elements/code-block'
import { ConversationRailItem } from '@/components/ai-elements/conversation-rail-item'
import {
  ModelMetaTag,
  ModelSelectorHeader,
} from '@/components/ai-elements/model-selector-header'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import { SessionStats } from '@/components/ai-elements/session-stats'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources'
import { SpeakerMessage } from '@/components/ai-elements/message'
import { StreamingCursor } from '@/components/ai-elements/streaming-cursor'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DemoBlock } from '../components/demo-block'

const SNIPPET = `export async function retry<T>(
  fn: () => Promise<T>,
  { tries = 5, base = 200 } = {}
) {
  // … full jitter backoff
}`

export default function AiCodeDemos() {
  const [activeChat, setActiveChat] = useState(0)

  return (
    <div className='flex flex-col gap-4'>
      <DemoBlock
        title='CodeBlock (chrome bar)'
        description='three dots + mono filename + copy→copied; shiki highlight; legacy floating-copy form unchanged'
      >
        <div className='flex w-full max-w-xl flex-col gap-4'>
          <CodeBlock code={SNIPPET} language='typescript' title='retry.ts' />
          <CodeBlock code={'pip install youbox'} language='bash' />
        </div>
      </DemoBlock>

      <DemoBlock
        title='SpeakerMessage + StreamingCursor'
        description='role tiles (user=surface-3 / assistant=brand-subtle), speaker labels, blinking caret with reduced-motion fallback'
      >
        <div className='flex w-full max-w-xl flex-col gap-5'>
          <SpeakerMessage from='user' tile='JD' speaker='You'>
            给我写一个 TypeScript 函数，用指数退避重试一个 promise。
          </SpeakerMessage>
          <SpeakerMessage from='assistant' tile='✦' speaker='Claude Opus 4.6'>
            Here's a typed <code className='font-mono text-[13px]'>retry</code>{' '}
            helper with exponential backoff and jitter
            <StreamingCursor />
          </SpeakerMessage>
        </div>
      </DemoBlock>

      <DemoBlock
        title='Reasoning / Sources (panel form)'
        description='collapsibles unified on the card surface; trigger + animated content'
      >
        <div className='flex w-full max-w-xl flex-col gap-3'>
          <Reasoning isStreaming={false} duration={4} defaultOpen={false}>
            <ReasoningTrigger />
            <ReasoningContent>
              The user wants a retry helper. Exponential backoff with full
              jitter avoids thundering herds…
            </ReasoningContent>
          </Reasoning>
          <Sources>
            <SourcesTrigger count={2} />
            <SourcesContent>
              <Source href='https://example.com/backoff' title='Exponential backoff and jitter' />
              <Source href='https://example.com/retry' title='Retry patterns' />
            </SourcesContent>
          </Sources>
        </div>
      </DemoBlock>

      <DemoBlock
        title='ModelSelectorHeader + ModelMetaTag'
        description='picker trigger + throughput/price tags + reset/share actions'
        bleed
      >
        <ModelSelectorHeader
          trigger={
            <Button variant='outline' className='gap-2.5 font-mono text-[13px]'>
              <Avatar className='size-5'>
                <AvatarFallback className='text-[9px] font-semibold'>AN</AvatarFallback>
              </Avatar>
              anthropic/claude-opus-4.6
              <ChevronDown className='text-muted-foreground' />
            </Button>
          }
          tags={
            <>
              <ModelMetaTag icon={<Zap />}>118 tok/s</ModelMetaTag>
              <ModelMetaTag>$3 / $15 per 1M</ModelMetaTag>
            </>
          }
          actions={
            <>
              <Button variant='ghost' size='icon' aria-label='Reset conversation'>
                <RotateCcw />
              </Button>
              <Button variant='ghost' size='icon' aria-label='Share'>
                <Share2 />
              </Button>
            </>
          }
        />
      </DemoBlock>

      <DemoBlock
        title='SessionStats'
        description='// this session — mono k/v rows'
      >
        <div className='w-56'>
          <SessionStats
            items={[
              { label: 'Tokens', value: '3,204' },
              { label: 'Cost', value: '$0.038' },
              { label: 'Latency', value: '0.41s' },
            ]}
          />
        </div>
      </DemoBlock>

      <DemoBlock
        title='ConversationRailItem'
        description='title + model/time sub; active state; click to switch'
      >
        <div className='flex w-64 flex-col gap-0.5'>
          {[
            ['Retry helper with backoff', 'Claude Opus 4.6 · 2m'],
            ['Summarize Q2 board deck', 'GPT-5.2 · 1h'],
            ['SQL for cohort retention', 'DeepSeek V4 · 3h'],
          ].map(([title, sub], index) => (
            <ConversationRailItem
              key={title}
              title={title}
              sub={sub}
              active={activeChat === index}
              onClick={() => setActiveChat(index)}
            />
          ))}
        </div>
      </DemoBlock>
    </div>
  )
}
