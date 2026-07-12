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
import { useId, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eyebrow } from '@/components/patterns'
import type {
  PlaygroundToolDefinition,
  ResponseFormat,
  ToolChoice,
} from '../types'

const SAMPLE_TOOL: PlaygroundToolDefinition = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get current weather for a city',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
      },
      required: ['city'],
    },
  },
}

interface ToolsEditorProps {
  tools: PlaygroundToolDefinition[]
  toolChoice: ToolChoice
  responseFormat: ResponseFormat
  onToolsChange: (tools: PlaygroundToolDefinition[]) => void
  onToolChoiceChange: (choice: ToolChoice) => void
  onResponseFormatChange: (format: ResponseFormat) => void
}

export function ToolsEditor({
  tools,
  toolChoice,
  responseFormat,
  onToolsChange,
  onToolChoiceChange,
  onResponseFormatChange,
}: ToolsEditorProps) {
  const { t } = useTranslation()
  const toolsId = useId()
  const schemaId = useId()
  const [toolsJson, setToolsJson] = useState(() =>
    JSON.stringify(tools.length ? tools : [], null, 2)
  )
  const [schemaJson, setSchemaJson] = useState(() =>
    responseFormat.type === 'json_schema'
      ? JSON.stringify(responseFormat.json_schema, null, 2)
      : '{\n  "name": "result",\n  "strict": true,\n  "schema": {\n    "type": "object",\n    "properties": {},\n    "additionalProperties": false\n  }\n}'
  )

  const applyTools = () => {
    try {
      const parsed = JSON.parse(toolsJson) as PlaygroundToolDefinition[]
      if (!Array.isArray(parsed)) throw new Error('not array')
      onToolsChange(parsed)
      toast.success(t('Tools updated'))
    } catch {
      toast.error(t('Invalid tools JSON'))
    }
  }

  const toolChoiceValue =
    typeof toolChoice === 'string' ? toolChoice : 'auto'

  const formatType = responseFormat.type

  return (
    <div className='flex flex-col gap-4'>
      <Eyebrow>{t('Tools (function calling)')}</Eyebrow>
      <p className='text-muted-foreground text-[12px]'>
        {t(
          'Define OpenAI-style tools. When the model returns tool_calls, fill results and continue the turn.'
        )}
      </p>
      <Textarea
        id={toolsId}
        value={toolsJson}
        onChange={(e) => setToolsJson(e.target.value)}
        className='min-h-32 font-mono text-xs'
        spellCheck={false}
      />
      <div className='flex flex-wrap gap-2'>
        <Button type='button' size='sm' onClick={applyTools}>
          {t('Apply tools')}
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => {
            setToolsJson(JSON.stringify([SAMPLE_TOOL], null, 2))
            onToolsChange([SAMPLE_TOOL])
          }}
        >
          <Plus className='size-3.5' />
          {t('Sample tool')}
        </Button>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          onClick={() => {
            setToolsJson('[]')
            onToolsChange([])
          }}
        >
          <Trash2 className='size-3.5' />
          {t('Clear')}
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-muted-foreground text-[13px]'>
          {t('Tool choice')}
        </label>
        <Select
          items={[
            { value: 'auto', label: t('Auto') },
            { value: 'none', label: t('None') },
            { value: 'required', label: t('Required') },
          ]}
          value={toolChoiceValue}
          onValueChange={(v) =>
            onToolChoiceChange((v as ToolChoice) || 'auto')
          }
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              <SelectItem value='auto'>{t('Auto')}</SelectItem>
              <SelectItem value='none'>{t('None')}</SelectItem>
              <SelectItem value='required'>{t('Required')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Eyebrow>{t('Response format')}</Eyebrow>
      <Select
        items={[
          { value: 'text', label: t('Text') },
          { value: 'json_object', label: t('JSON object') },
          { value: 'json_schema', label: t('JSON schema') },
        ]}
        value={formatType}
        onValueChange={(v) => {
          if (v === 'json_object') {
            onResponseFormatChange({ type: 'json_object' })
          } else if (v === 'json_schema') {
            try {
              const schema = JSON.parse(schemaJson) as {
                name: string
                strict?: boolean
                schema: Record<string, unknown>
              }
              onResponseFormatChange({ type: 'json_schema', json_schema: schema })
            } catch {
              onResponseFormatChange({
                type: 'json_schema',
                json_schema: {
                  name: 'result',
                  schema: { type: 'object', properties: {} },
                },
              })
            }
          } else {
            onResponseFormatChange({ type: 'text' })
          }
        }}
      >
        <SelectTrigger className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            <SelectItem value='text'>{t('Text')}</SelectItem>
            <SelectItem value='json_object'>{t('JSON object')}</SelectItem>
            <SelectItem value='json_schema'>{t('JSON schema')}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {formatType === 'json_schema' && (
        <>
          <Textarea
            id={schemaId}
            value={schemaJson}
            onChange={(e) => setSchemaJson(e.target.value)}
            className='min-h-28 font-mono text-xs'
            spellCheck={false}
          />
          <Button
            type='button'
            size='sm'
            onClick={() => {
              try {
                const schema = JSON.parse(schemaJson) as {
                  name: string
                  strict?: boolean
                  schema: Record<string, unknown>
                }
                onResponseFormatChange({
                  type: 'json_schema',
                  json_schema: schema,
                })
                toast.success(t('Schema applied'))
              } catch {
                toast.error(t('Invalid JSON schema'))
              }
            }}
          >
            {t('Apply schema')}
          </Button>
        </>
      )}
    </div>
  )
}
