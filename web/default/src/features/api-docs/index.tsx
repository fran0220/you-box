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
import { useAuthStore } from '@/stores/auth-store'
import { useScrollSpy } from '@/hooks/use-scroll-spy'
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
import { DocsLayout } from './components/docs-layout'
import {
  DocsErrorTable,
  DocsParamTable,
} from './components/docs-param-table'
import { getUserModels } from '@/features/playground/api'
import {
  buildCurl,
  buildJs,
  buildPython,
  buildRequestBody,
  type ApiDocsBuilderState,
} from './lib/api-docs-snippets'
import { DOCS_SECTION_IDS } from './lib/docs-nav'
import {
  API_ERROR_CODES,
  CHAT_COMPLETION_PARAMS,
  SAMPLE_RESPONSE_JSON,
} from './lib/docs-reference'

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

function DocsSectionHeading(props: { children: React.ReactNode }) {
  return (
    <h2 className='font-display text-text-strong scroll-mt-24 text-xl font-semibold tracking-[-0.01em]'>
      {props.children}
    </h2>
  )
}

export function ApiDocs() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-host'
  const [state, setState] = useState<ApiDocsBuilderState>(DEFAULT_BUILDER)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState('')
  const [resultIsError, setResultIsError] = useState(false)

  const activeSection = useScrollSpy({
    sectionIds: DOCS_SECTION_IDS,
    defaultId: 'overview',
  })

  const set = <K extends keyof ApiDocsBuilderState>(
    key: K,
    value: ApiDocsBuilderState[K]
  ) => setState((prev) => ({ ...prev, [key]: value }))

  const { data: models = [] } = useQuery({
    queryKey: ['api-docs-models'],
    queryFn: () => getUserModels(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const curl = useMemo(() => buildCurl(base, state), [base, state])
  const python = useMemo(() => buildPython(base, state), [base, state])
  const js = useMemo(() => buildJs(base, state), [base, state])

  const docsToc = useMemo(
    () => [
      { id: 'overview', text: t('Introduction') },
      { id: 'quickstart', text: t('Quickstart') },
      { id: 'authentication', text: t('Authentication') },
      { id: 'base-url', text: t('Base URL') },
      { id: 'chat-completions', text: t('Chat completions') },
      { id: 'request-parameters', text: t('Request parameters') },
      { id: 'response', text: t('Response') },
      { id: 'errors', text: t('Error codes') },
      { id: 'request-builder', text: t('Try it') },
    ],
    [t]
  )

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
        <DocsLayout
          activeSection={activeSection}
          activeTocId={activeSection}
          toc={docsToc}
        >
          <div className='space-y-10 pb-10'>
            <section id='overview' className='scroll-mt-24'>
              <p className='text-brand mb-3 font-mono text-[11px] tracking-[0.12em] uppercase'>
                {'// '}
                {t('Get started')}
              </p>
              <PageHeader
                eyebrow='API'
                title={t('Quickstart')}
                subtitle={t(
                  'YouBox exposes a single OpenAI-compatible endpoint that routes to 300+ models. If you already use the OpenAI SDK, change the base URL, add your key, and pass a provider-prefixed model slug.'
                )}
              />
            </section>

            <section id='quickstart' className='scroll-mt-24 space-y-3'>
              <DocsSectionHeading>{t('Quickstart')}</DocsSectionHeading>
              <p className='text-muted-foreground text-[15px] leading-relaxed'>
                {t(
                  'Create an API key, set the base URL to your gateway host, and call chat completions with any supported model slug.'
                )}
              </p>
            </section>

            <section id='authentication' className='scroll-mt-24 space-y-3'>
              <DocsSectionHeading>{t('Authentication')}</DocsSectionHeading>
              <p className='text-muted-foreground text-[15px] leading-relaxed'>
                {t(
                  'Authenticate with a bearer token. Create a key in API keys and pass it in the Authorization header. Keep it server-side — never ship it to a browser.'
                )}
              </p>
            </section>

            <section id='base-url' className='scroll-mt-24 space-y-3'>
              <DocsSectionHeading>{t('Base URL')}</DocsSectionHeading>
              <p className='text-muted-foreground text-[15px] leading-relaxed'>
                {t('All requests go to one host. Point any OpenAI-compatible client at it:')}
              </p>
              <CodeBlock
                code={`${base}/v1`}
                language='bash'
                langLabel='http'
                showDots
              />
            </section>

            <section id='chat-completions' className='scroll-mt-24 space-y-4'>
              <DocsSectionHeading>{t('Your first call')}</DocsSectionHeading>
              <p className='text-muted-foreground text-[15px] leading-relaxed'>
                {t(
                  'Send a chat completion. Switch providers by changing only the model string.'
                )}
              </p>
              <Tabs defaultValue='curl' className='min-w-0 gap-3'>
                <TabsList>
                  <TabsTrigger value='curl'>cURL</TabsTrigger>
                  <TabsTrigger value='python'>Python</TabsTrigger>
                  <TabsTrigger value='js'>JavaScript</TabsTrigger>
                </TabsList>
                <TabsContent value='curl' className='min-w-0'>
                  <CodeBlock code={curl} language='bash' langLabel='bash' />
                </TabsContent>
                <TabsContent value='python' className='min-w-0'>
                  <CodeBlock code={python} language='python' langLabel='python' />
                </TabsContent>
                <TabsContent value='js' className='min-w-0'>
                  <CodeBlock
                    code={js}
                    language='javascript'
                    langLabel='javascript'
                  />
                </TabsContent>
              </Tabs>
            </section>

            <section id='request-parameters' className='scroll-mt-24 space-y-3'>
              <DocsSectionHeading>{t('Request parameters')}</DocsSectionHeading>
              <p className='text-muted-foreground text-[15px] leading-relaxed'>
                {t(
                  'The body follows the OpenAI Chat Completions schema, with a few YouBox extensions for routing.'
                )}
              </p>
              <DocsParamTable rows={CHAT_COMPLETION_PARAMS} />
            </section>

            <section id='response' className='scroll-mt-24 space-y-3'>
              <DocsSectionHeading>{t('Response')}</DocsSectionHeading>
              <CodeBlock
                code={SAMPLE_RESPONSE_JSON}
                language='json'
                langLabel='json'
              />
            </section>

            <section id='errors' className='scroll-mt-24 space-y-3'>
              <DocsSectionHeading>{t('Error codes')}</DocsSectionHeading>
              <DocsErrorTable rows={API_ERROR_CODES} />
            </section>

            <section id='request-builder' className='scroll-mt-24 space-y-4'>
              <DocsSectionHeading>{t('Try it')}</DocsSectionHeading>
              <div className='grid items-start gap-6 lg:grid-cols-2'>
                <Card className='flex flex-col gap-4 p-5'>
                  <h3 className='text-foreground text-sm font-semibold'>
                    {t('Request builder')}
                  </h3>

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
                      onChange={(event) =>
                        set('systemPrompt', event.target.value)
                      }
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

                <div className='text-muted-foreground text-sm leading-relaxed'>
                  {t(
                    'Use the builder to test live requests against your session. Generated code samples above stay in sync with the same parameters.'
                  )}
                </div>
              </div>
            </section>
          </div>
        </DocsLayout>
      </PageTransition>
    </AppShell>
  )
}