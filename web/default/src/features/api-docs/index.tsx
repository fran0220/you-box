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
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { AppShell } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { CodeBlock, PageHeader } from '@/components/youbox'
import { getUserModels } from '@/features/playground/api'
import {
  buildCurl,
  buildJs,
  buildPython,
  buildRequestBody,
  type ApiDocsBuilderState,
} from './lib/api-docs-snippets'

const DEFAULT_BUILDER: ApiDocsBuilderState = {
  model: 'gpt-4o',
  systemPrompt: '',
  userMessage: 'Hello! Tell me a fun fact about the ocean.',
  temperature: 0.7,
  maxTokens: 512,
  stream: false,
}

function ModelQuickPicks(props: {
  models: { label: string; value: string }[]
  selected: string
  onSelect: (value: string) => void
}) {
  if (props.models.length === 0) {
    return null
  }
  return (
    <div className='flex flex-wrap gap-1.5 pt-1'>
      {props.models.slice(0, 8).map((model) => (
        <button
          key={model.value}
          type='button'
          onClick={() => props.onSelect(model.value)}
          className='rounded-sm focus-visible:shadow-[var(--ring)] focus-visible:outline-none'
        >
          <Badge
            variant='secondary'
            className={cn(
              'cursor-pointer font-sans text-xs transition-colors',
              props.selected === model.value &&
                'border-brand/30 bg-brand-subtle text-brand'
            )}
          >
            {model.label}
          </Badge>
        </button>
      ))}
    </div>
  )
}

export function ApiDocs() {
  const { t } = useTranslation()
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-host'
  const [state, setState] = useState<ApiDocsBuilderState>(DEFAULT_BUILDER)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState('')
  const [resultIsError, setResultIsError] = useState(false)

  const set = <K extends keyof ApiDocsBuilderState>(
    key: K,
    value: ApiDocsBuilderState[K]
  ) => setState((prev) => ({ ...prev, [key]: value }))

  // Available models (only when authenticated); used as quick-picks.
  const { data: models = [] } = useQuery({
    queryKey: ['api-docs-models'],
    queryFn: async () => {
      try {
        return await getUserModels()
      } catch {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const curl = useMemo(() => buildCurl(base, state), [base, state])
  const python = useMemo(() => buildPython(base, state), [base, state])
  const js = useMemo(() => buildJs(base, state), [base, state])

  const handleRun = async () => {
    setRunning(true)
    setResult('')
    setResultIsError(false)
    try {
      const res = await api.post(
        '/pg/chat/completions',
        { ...buildRequestBody(state), stream: false, group: 'default' },
        { skipErrorHandler: true } as Record<string, unknown>
      )
      const content = res.data?.choices?.[0]?.message?.content
      setResult(content ? String(content) : JSON.stringify(res.data, null, 2))
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: { message?: string }; message?: string } }
        message?: string
      }
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        t('Request failed')
      toast.error(message)
      setResultIsError(true)
      setResult(`# ${t('Error')}\n${message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <AppShell variant='public'>
      <PageTransition className='pb-12'>
        <div className='mx-auto w-full max-w-[1080px] space-y-6'>
          <PageHeader
            eyebrow='API'
            title={t('API reference')}
            subtitle={t(
              'An OpenAI-compatible API. Point any OpenAI SDK at the base URL below and use one of your API keys.'
            )}
          />

          <Card className='border-border bg-card gap-0 p-4'>
            <div className='text-muted-foreground mb-1 font-mono text-[11px] tracking-wide uppercase'>
              {t('Base URL')}
            </div>
            <code className='text-foreground font-mono text-sm break-all'>
              {base}/v1
            </code>
          </Card>

          <div className='grid items-start gap-6 lg:grid-cols-2'>
            <Card className='flex flex-col gap-4 p-5'>
              <h2 className='text-foreground text-sm font-semibold'>
                {t('Request builder')}
              </h2>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='api-docs-model'>{t('Model')}</Label>
                <Input
                  id='api-docs-model'
                  value={state.model}
                  onChange={(event) => set('model', event.target.value)}
                  placeholder='gpt-4o'
                />
                <ModelQuickPicks
                  models={models}
                  selected={state.model}
                  onSelect={(value) => set('model', value)}
                />
              </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='api-docs-system'>{t('System prompt')}</Label>
              <Textarea
                id='api-docs-system'
                value={state.systemPrompt}
                onChange={(event) => set('systemPrompt', event.target.value)}
                placeholder={t('Optional')}
                rows={2}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='api-docs-user'>{t('User message')}</Label>
              <Textarea
                id='api-docs-user'
                value={state.userMessage}
                onChange={(event) => set('userMessage', event.target.value)}
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='api-docs-temp'>{t('Temperature')}</Label>
                <Input
                  id='api-docs-temp'
                  type='number'
                  step={0.1}
                  min={0}
                  max={2}
                  value={state.temperature}
                  onChange={(event) =>
                    set('temperature', Number(event.target.value) || 0)
                  }
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='api-docs-max'>{t('Max tokens')}</Label>
                <Input
                  id='api-docs-max'
                  type='number'
                  min={1}
                  value={state.maxTokens}
                  onChange={(event) =>
                    set('maxTokens', Number(event.target.value) || 1)
                  }
                />
              </div>
            </div>

              <div className='flex items-center justify-between gap-4'>
                <Label htmlFor='api-docs-stream'>{t('Stream response')}</Label>
                <Switch
                  id='api-docs-stream'
                  checked={state.stream}
                  onCheckedChange={(checked) => set('stream', checked)}
                />
              </div>

              <Button
                onClick={handleRun}
                disabled={running}
                className='gap-1.5 self-start'
              >
                {running ? (
                  <Loader2 className='size-4 animate-spin' aria-hidden />
                ) : (
                  <Play className='size-4' aria-hidden />
                )}
                {t('Run')}
              </Button>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {t(
                  'Running uses your session; sign in if the request is rejected.'
                )}
              </p>

              {result ? (
                <div className='flex flex-col gap-1.5'>
                  <Label>{t('Response')}</Label>
                  <pre
                    className={cn(
                      'max-h-64 overflow-auto rounded-lg border p-3 font-mono text-xs whitespace-pre-wrap',
                      resultIsError
                        ? 'border-destructive/40 bg-destructive/5 text-destructive'
                        : 'border-border bg-muted/30 text-foreground'
                    )}
                  >
                    {result}
                  </pre>
                </div>
              ) : null}
            </Card>

            <section className='flex min-w-0 flex-col gap-4'>
              <h2 className='text-foreground text-sm font-semibold'>
                {t('Code')}
              </h2>
              <Tabs defaultValue='curl' className='min-w-0 gap-3'>
                <TabsList>
                  <TabsTrigger value='curl'>cURL</TabsTrigger>
                  <TabsTrigger value='python'>Python</TabsTrigger>
                  <TabsTrigger value='js'>JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value='curl' className='min-w-0'>
                  <CodeBlock
                    code={curl}
                    language='bash'
                    title='request.sh'
                    langLabel='bash'
                  />
                </TabsContent>
                <TabsContent value='python' className='min-w-0'>
                  <CodeBlock
                    code={python}
                    language='python'
                    title='example.py'
                    langLabel='python'
                  />
                </TabsContent>
                <TabsContent value='js' className='min-w-0'>
                  <CodeBlock
                    code={js}
                    language='javascript'
                    title='example.ts'
                    langLabel='javascript'
                  />
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  )
}
