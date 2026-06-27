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
import { Play, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { CodeBlock } from '@/components/ai-elements/code-block'
import { AppShell } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { getUserModels } from '@/features/playground/api'

interface BuilderState {
  model: string
  systemPrompt: string
  userMessage: string
  temperature: number
  maxTokens: number
  stream: boolean
}

const DEFAULT_BUILDER: BuilderState = {
  model: 'gpt-4o',
  systemPrompt: '',
  userMessage: 'Hello! Tell me a fun fact about the ocean.',
  temperature: 0.7,
  maxTokens: 512,
  stream: false,
}

function buildRequestBody(state: BuilderState) {
  const messages: Array<{ role: string; content: string }> = []
  if (state.systemPrompt.trim()) {
    messages.push({ role: 'system', content: state.systemPrompt.trim() })
  }
  messages.push({ role: 'user', content: state.userMessage })
  return {
    model: state.model,
    messages,
    temperature: state.temperature,
    max_tokens: state.maxTokens,
    stream: state.stream,
  }
}

function buildCurl(base: string, state: BuilderState): string {
  const body = JSON.stringify(buildRequestBody(state), null, 2)
  return `curl ${base}/v1/chat/completions \\
  -H "Authorization: Bearer $YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`
}

function buildPython(base: string, state: BuilderState): string {
  const body = buildRequestBody(state)
  return `from openai import OpenAI

client = OpenAI(
    base_url="${base}/v1",
    api_key="YOUR_API_KEY",
)

response = client.chat.completions.create(
    model="${body.model}",
    messages=${JSON.stringify(body.messages, null, 4)},
    temperature=${body.temperature},
    max_tokens=${body.max_tokens},
    stream=${state.stream ? 'True' : 'False'},
)

print(response.choices[0].message.content)`
}

function buildJs(base: string, state: BuilderState): string {
  const body = buildRequestBody(state)
  return `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: '${base}/v1',
  apiKey: 'YOUR_API_KEY',
})

const response = await client.chat.completions.create(${JSON.stringify(
    body,
    null,
    2
  )})

console.log(response.choices[0].message.content)`
}

export function ApiDocs() {
  const { t } = useTranslation()
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://your-host'
  const [state, setState] = useState<BuilderState>(DEFAULT_BUILDER)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string>('')

  const set = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }))

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
    try {
      // The playground proxy authenticates with the current session, so the
      // request runs without exposing an API key in the browser.
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
      setResult(`# ${t('Error')}\n${message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <AppShell variant='public'>
      <PageTransition className='pb-12'>
        <div className='mb-6'>
          <p className='yb-eyebrow mb-3'>{'// '}API</p>
          <h1 className='font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.03em]'>
            {t('API reference')}
          </h1>
          <p className='text-muted-foreground/70 mt-2 max-w-2xl text-sm'>
            {t(
              'An OpenAI-compatible API. Point any OpenAI SDK at the base URL below and use one of your API keys.'
            )}
          </p>
        </div>

        <div className='mb-6 rounded-xl border p-4'>
          <div className='text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase'>
            {t('Base URL')}
          </div>
          <code className='font-mono text-sm break-all'>{base}/v1</code>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Request builder */}
          <section className='flex flex-col gap-4'>
            <h2 className='text-sm font-semibold'>{t('Request builder')}</h2>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='api-docs-model'>{t('Model')}</Label>
              <Input
                id='api-docs-model'
                value={state.model}
                onChange={(event) => set('model', event.target.value)}
                placeholder='gpt-4o'
              />
              {models.length > 0 && (
                <div className='flex flex-wrap gap-1.5 pt-1'>
                  {models.slice(0, 8).map((model) => (
                    <button
                      key={model.value}
                      type='button'
                      onClick={() => set('model', model.value)}
                      className='bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md px-2 py-0.5 text-xs'
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
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

            <div className='flex items-center justify-between'>
              <Label htmlFor='api-docs-stream'>{t('Stream response')}</Label>
              <Switch
                id='api-docs-stream'
                checked={state.stream}
                onCheckedChange={(checked) => set('stream', checked)}
              />
            </div>

            <Button onClick={handleRun} disabled={running} className='gap-1.5'>
              {running ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Play className='size-4' />
              )}
              {t('Run')}
            </Button>
            <p className='text-muted-foreground/70 text-xs'>
              {t(
                'Running uses your session; sign in if the request is rejected.'
              )}
            </p>

            {result && (
              <div className='flex flex-col gap-1.5'>
                <Label>{t('Response')}</Label>
                <pre className='bg-muted/40 max-h-64 overflow-auto rounded-lg border p-3 text-xs whitespace-pre-wrap'>
                  {result}
                </pre>
              </div>
            )}
          </section>

          {/* Generated snippets */}
          <section className='flex min-w-0 flex-col gap-4'>
            <h2 className='text-sm font-semibold'>{t('Code')}</h2>
            <Tabs defaultValue='curl'>
              <TabsList>
                <TabsTrigger value='curl'>cURL</TabsTrigger>
                <TabsTrigger value='python'>Python</TabsTrigger>
                <TabsTrigger value='js'>JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value='curl'>
                <CodeBlock code={curl} language='bash' title='request.sh' />
              </TabsContent>
              <TabsContent value='python'>
                <CodeBlock code={python} language='python' title='example.py' />
              </TabsContent>
              <TabsContent value='js'>
                <CodeBlock code={js} language='javascript' title='example.ts' />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  )
}
