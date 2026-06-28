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
import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ImageIcon, Layers, ListOrdered, Loader2, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { SectionPageLayout } from '@/components/layout'
import { PageHeader } from '@/components/youbox'
import { getUserModels } from '@/features/playground/api'

const PG = {
  embeddings: '/pg/embeddings',
  images: '/pg/images/generations',
  rerank: '/pg/rerank',
} as const

async function postPg<T>(path: string, body: unknown): Promise<T> {
  const res = await api.post(path, body, {
    skipErrorHandler: true,
  } as Record<string, unknown>)
  return res.data as T
}

function errorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { error?: { message?: string }; message?: string } }
    message?: string
  }
  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  )
}

function ModelField(props: {
  id: string
  value: string
  onChange: (value: string) => void
  models: { label: string; value: string }[]
  placeholder?: string
}) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col gap-1.5'>
      <Label htmlFor={props.id}>{t('Model')}</Label>
      <Input
        id={props.id}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
      />
      {props.models.length > 0 && (
        <div className='flex flex-wrap gap-1.5 pt-1'>
          {props.models.slice(0, 10).map((model) => (
            <button
              key={model.value}
              type='button'
              onClick={() => props.onChange(model.value)}
              className='rounded-sm focus-visible:shadow-[var(--ring)] focus-visible:outline-none'
            >
              <Badge
                variant='secondary'
                className={cn(
                  'cursor-pointer font-sans text-xs transition-colors',
                  props.value === model.value &&
                    'border-brand/30 bg-brand-subtle text-brand'
                )}
              >
                {model.label}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ApiToolsResultPanel(props: {
  title: string
  children: ReactNode
  emptyHint?: string
  hasContent: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className='min-w-0'>
      <div className='text-muted-foreground mb-3 font-mono text-[11px] tracking-wide uppercase'>
        {props.title}
      </div>
      {props.hasContent ? (
        props.children
      ) : (
        <Card className='border-border bg-card text-muted-foreground p-6 text-sm'>
          {props.emptyHint ?? t('Run a request to see results here.')}
        </Card>
      )}
    </div>
  )
}

// ---- Embeddings -----------------------------------------------------------

interface EmbeddingResponse {
  data?: Array<{ embedding: number[] }>
  usage?: { prompt_tokens?: number; total_tokens?: number }
}

function EmbeddingsTab({
  models,
}: {
  models: { label: string; value: string }[]
}) {
  const { t } = useTranslation()
  const [model, setModel] = useState('text-embedding-3-small')
  const [input, setInput] = useState(
    'The quick brown fox jumps over the lazy dog.'
  )
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<EmbeddingResponse | null>(null)

  const run = async () => {
    setRunning(true)
    setResult(null)
    try {
      const data = await postPg<EmbeddingResponse>(PG.embeddings, {
        model,
        input,
      })
      setResult(data)
    } catch (error) {
      toast.error(errorMessage(error, t('Request failed')))
    } finally {
      setRunning(false)
    }
  }

  const vector = result?.data?.[0]?.embedding

  return (
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-6'>
      <Card className='flex flex-col gap-4 p-5'>
        <ModelField
          id='emb-model'
          value={model}
          onChange={setModel}
          models={models}
          placeholder='text-embedding-3-small'
        />
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='emb-input'>{t('Input text')}</Label>
          <Textarea
            id='emb-input'
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={4}
          />
        </div>
        <Button
          onClick={run}
          disabled={running || !input.trim()}
          className='gap-1.5 self-start'
        >
          {running ? (
            <Loader2 className='size-4 animate-spin' aria-hidden />
          ) : (
            <Play className='size-4' aria-hidden />
          )}
          {t('Generate embedding')}
        </Button>
      </Card>
      <ApiToolsResultPanel
        title={t('Result')}
        hasContent={Boolean(vector)}
        emptyHint={t(
          'Generate an embedding to see vector dimensions and preview.'
        )}
      >
        {vector && (
          <Card className='gap-2 p-4'>
            <div className='text-muted-foreground font-mono text-xs'>
              {t('{{dims}} dimensions', { dims: vector.length })}
              {result?.usage?.total_tokens != null &&
                ` · ${result.usage.total_tokens} ${t('tokens')}`}
            </div>
            <code className='text-muted-foreground block max-h-40 overflow-auto font-mono text-xs leading-relaxed'>
              [
              {vector
                .slice(0, 16)
                .map((v) => v.toFixed(5))
                .join(', ')}
              {vector.length > 16 ? ', …' : ''}]
            </code>
          </Card>
        )}
      </ApiToolsResultPanel>
    </div>
  )
}

// ---- Image generation -----------------------------------------------------

interface ImageResponse {
  data?: Array<{ url?: string; b64_json?: string }>
}

function ImagesTab({ models }: { models: { label: string; value: string }[] }) {
  const { t } = useTranslation()
  const [model, setModel] = useState('dall-e-3')
  const [prompt, setPrompt] = useState(
    'A serene watercolor of a lighthouse at dawn.'
  )
  const [size, setSize] = useState('1024x1024')
  const [running, setRunning] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const run = async () => {
    setRunning(true)
    setImages([])
    try {
      const data = await postPg<ImageResponse>(PG.images, {
        model,
        prompt,
        size,
        n: 1,
      })
      const urls = (data.data ?? [])
        .map((item) =>
          item.url
            ? item.url
            : item.b64_json
              ? `data:image/png;base64,${item.b64_json}`
              : ''
        )
        .filter(Boolean)
      setImages(urls)
      if (urls.length === 0) toast.info(t('No image returned'))
    } catch (error) {
      toast.error(errorMessage(error, t('Request failed')))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-6'>
      <Card className='flex flex-col gap-4 p-5'>
        <ModelField
          id='img-model'
          value={model}
          onChange={setModel}
          models={models}
          placeholder='dall-e-3'
        />
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='img-prompt'>{t('Prompt')}</Label>
          <Textarea
            id='img-prompt'
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='img-size'>{t('Size')}</Label>
          <Input
            id='img-size'
            value={size}
            onChange={(event) => setSize(event.target.value)}
            placeholder='1024x1024'
            className='max-w-40'
          />
        </div>
        <Button
          onClick={run}
          disabled={running || !prompt.trim()}
          className='gap-1.5 self-start'
        >
          {running ? (
            <Loader2 className='size-4 animate-spin' aria-hidden />
          ) : (
            <Play className='size-4' aria-hidden />
          )}
          {t('Generate image')}
        </Button>
      </Card>
      <ApiToolsResultPanel
        title={t('Result')}
        hasContent={images.length > 0}
        emptyHint={t('Generate an image to preview it here.')}
      >
        {images.length > 0 && (
          <div className='grid gap-3 sm:grid-cols-2'>
            {images.map((src, index) => (
              <Card key={index} className='border-border overflow-hidden p-0'>
                <img
                  src={src}
                  alt={t('Generated image')}
                  className='aspect-square w-full object-cover'
                />
              </Card>
            ))}
          </div>
        )}
      </ApiToolsResultPanel>
    </div>
  )
}

// ---- Rerank ----------------------------------------------------------------

interface RerankResponse {
  results?: Array<{
    index: number
    relevance_score?: number
    document?: { text?: string } | string
  }>
}

function RerankTab({ models }: { models: { label: string; value: string }[] }) {
  const { t } = useTranslation()
  const [model, setModel] = useState('rerank-1')
  const [query, setQuery] = useState('What is the capital of France?')
  const [documents, setDocuments] = useState(
    'Paris is the capital of France.\nBerlin is the capital of Germany.\nThe Eiffel Tower is in Paris.'
  )
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<RerankResponse['results']>([])

  const docList = documents
    .split('\n')
    .map((d) => d.trim())
    .filter(Boolean)

  const run = async () => {
    setRunning(true)
    setResults([])
    try {
      const data = await postPg<RerankResponse>(PG.rerank, {
        model,
        query,
        documents: docList,
        top_n: docList.length,
      })
      setResults(data.results ?? [])
    } catch (error) {
      toast.error(errorMessage(error, t('Request failed')))
    } finally {
      setRunning(false)
    }
  }

  const docText = (
    doc: { text?: string } | string | undefined,
    index: number
  ): string => {
    if (typeof doc === 'string') return doc
    if (doc?.text) return doc.text
    return docList[index] ?? ''
  }

  return (
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-6'>
      <Card className='flex flex-col gap-4 p-5'>
        <ModelField
          id='rerank-model'
          value={model}
          onChange={setModel}
          models={models}
          placeholder='rerank-1'
        />
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='rerank-query'>{t('Query')}</Label>
          <Input
            id='rerank-query'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='rerank-docs'>{t('Documents (one per line)')}</Label>
          <Textarea
            id='rerank-docs'
            value={documents}
            onChange={(event) => setDocuments(event.target.value)}
            rows={5}
          />
        </div>
        <Button
          onClick={run}
          disabled={running || !query.trim() || docList.length === 0}
          className='gap-1.5 self-start'
        >
          {running ? (
            <Loader2 className='size-4 animate-spin' aria-hidden />
          ) : (
            <Play className='size-4' aria-hidden />
          )}
          {t('Rerank')}
        </Button>
      </Card>
      <ApiToolsResultPanel
        title={t('Result')}
        hasContent={Boolean(results && results.length > 0)}
        emptyHint={t('Rerank documents to see ordered results with scores.')}
      >
        {results && results.length > 0 && (
          <ol className='flex flex-col gap-2'>
            {results.map((item, rank) => (
              <li key={`${item.index}-${rank}`}>
                <Card className='flex items-start gap-3 p-3'>
                  <span className='text-muted-foreground shrink-0 font-mono text-xs'>
                    #{rank + 1}
                  </span>
                  <span className='min-w-0 flex-1 text-sm'>
                    {docText(item.document, item.index)}
                  </span>
                  {item.relevance_score != null && (
                    <span className='text-muted-foreground shrink-0 font-mono text-xs'>
                      {item.relevance_score.toFixed(4)}
                    </span>
                  )}
                </Card>
              </li>
            ))}
          </ol>
        )}
      </ApiToolsResultPanel>
    </div>
  )
}

export function ApiTools() {
  const { t } = useTranslation()
  const { data: models = [] } = useQuery({
    queryKey: ['api-tools-models'],
    queryFn: async () => {
      try {
        return await getUserModels()
      } catch {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <SectionPageLayout>
      <SectionPageLayout.Content>
        <div className='mx-auto w-full max-w-[1080px] space-y-5 pb-10'>
          <PageHeader
            eyebrow={t('Workspace')}
            title={t('API tools')}
            subtitle={t(
              'Try embeddings, image generation, and rerank against your configured models — authenticated with your session.'
            )}
          />

          <Tabs defaultValue='embeddings' className='gap-4'>
            <TabsList className='mb-1'>
              <TabsTrigger value='embeddings' className='gap-1.5'>
                <Layers className='size-4' aria-hidden />
                {t('Embeddings')}
              </TabsTrigger>
              <TabsTrigger value='images' className='gap-1.5'>
                <ImageIcon className='size-4' aria-hidden />
                {t('Image')}
              </TabsTrigger>
              <TabsTrigger value='rerank' className='gap-1.5'>
                <ListOrdered className='size-4' aria-hidden />
                {t('Rerank')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value='embeddings'>
              <EmbeddingsTab models={models} />
            </TabsContent>
            <TabsContent value='images'>
              <ImagesTab models={models} />
            </TabsContent>
            <TabsContent value='rerank'>
              <RerankTab models={models} />
            </TabsContent>
          </Tabs>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
