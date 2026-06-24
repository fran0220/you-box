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
import { useQuery } from '@tanstack/react-query'
import { ImageIcon, Layers, ListOrdered, Loader2, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
              className='bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md px-2 py-0.5 text-xs'
            >
              {model.label}
            </button>
          ))}
        </div>
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
    <div className='flex flex-col gap-4'>
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
          <Loader2 className='size-4 animate-spin' />
        ) : (
          <Play className='size-4' />
        )}
        {t('Generate embedding')}
      </Button>
      {vector && (
        <div className='flex flex-col gap-2 rounded-lg border p-3'>
          <div className='text-muted-foreground text-xs'>
            {t('{{dims}} dimensions', { dims: vector.length })}
            {result?.usage?.total_tokens != null &&
              ` · ${result.usage.total_tokens} ${t('tokens')}`}
          </div>
          <code className='text-muted-foreground block max-h-32 overflow-auto font-mono text-xs'>
            [
            {vector
              .slice(0, 16)
              .map((v) => v.toFixed(5))
              .join(', ')}
            {vector.length > 16 ? ', …' : ''}]
          </code>
        </div>
      )}
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
    <div className='flex flex-col gap-4'>
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
          className='w-40'
        />
      </div>
      <Button
        onClick={run}
        disabled={running || !prompt.trim()}
        className='gap-1.5 self-start'
      >
        {running ? (
          <Loader2 className='size-4 animate-spin' />
        ) : (
          <Play className='size-4' />
        )}
        {t('Generate image')}
      </Button>
      {images.length > 0 && (
        <div className='flex flex-wrap gap-3'>
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={t('Generated image')}
              className='max-w-full rounded-lg border sm:max-w-sm'
            />
          ))}
        </div>
      )}
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
    <div className='flex flex-col gap-4'>
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
          <Loader2 className='size-4 animate-spin' />
        ) : (
          <Play className='size-4' />
        )}
        {t('Rerank')}
      </Button>
      {results && results.length > 0 && (
        <ol className='flex flex-col gap-2'>
          {results.map((item, rank) => (
            <li
              key={`${item.index}-${rank}`}
              className='flex items-start gap-3 rounded-lg border p-3'
            >
              <span className='text-muted-foreground font-mono text-xs'>
                #{rank + 1}
              </span>
              <span className='min-w-0 flex-1 text-sm'>
                {docText(item.document, item.index)}
              </span>
              {item.relevance_score != null && (
                <span className='text-muted-foreground font-mono text-xs'>
                  {item.relevance_score.toFixed(4)}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
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
    <div className='mx-auto w-full max-w-3xl px-4 py-6'>
      <header className='mb-5'>
        <h1 className='text-xl font-semibold'>{t('API tools')}</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          {t(
            'Try embeddings, image generation, and rerank against your configured models — authenticated with your session.'
          )}
        </p>
      </header>

      <Tabs defaultValue='embeddings'>
        <TabsList>
          <TabsTrigger value='embeddings' className='gap-1.5'>
            <Layers className='size-4' />
            {t('Embeddings')}
          </TabsTrigger>
          <TabsTrigger value='images' className='gap-1.5'>
            <ImageIcon className='size-4' />
            {t('Image')}
          </TabsTrigger>
          <TabsTrigger value='rerank' className='gap-1.5'>
            <ListOrdered className='size-4' />
            {t('Rerank')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value='embeddings' className='pt-4'>
          <EmbeddingsTab models={models} />
        </TabsContent>
        <TabsContent value='images' className='pt-4'>
          <ImagesTab models={models} />
        </TabsContent>
        <TabsContent value='rerank' className='pt-4'>
          <RerankTab models={models} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
