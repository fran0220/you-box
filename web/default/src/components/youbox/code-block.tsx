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
/* eslint-disable react-refresh/only-export-components */
'use client'

import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Element } from 'hast'
import { CheckIcon, CopyIcon } from 'lucide-react'
import {
  type BundledLanguage,
  codeToHtml,
  type ShikiTransformer,
} from 'shiki/bundle/web'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string
  language: BundledLanguage
  showLineNumbers?: boolean
  /** Mono filename in the chrome bar. */
  title?: string
  /** Uppercase language label in the chrome bar. */
  langLabel?: string
  showDots?: boolean
}

type CodeBlockContextType = {
  code: string
}

const CodeBlockContext = createContext<CodeBlockContextType>({ code: '' })

const lineNumberTransformer: ShikiTransformer = {
  name: 'line-numbers',
  line(node: Element, line: number) {
    node.children.unshift({
      type: 'element',
      tagName: 'span',
      properties: {
        className: [
          'inline-block',
          'min-w-10',
          'mr-4',
          'text-right',
          'select-none',
          'text-muted-foreground',
        ],
      },
      children: [{ type: 'text', value: String(line) }],
    })
  },
}

export async function highlightCode(
  code: string,
  language: BundledLanguage,
  showLineNumbers = false
) {
  const transformers: ShikiTransformer[] = showLineNumbers
    ? [lineNumberTransformer]
    : []

  return codeToHtml(code, {
    lang: language,
    themes: {
      light: 'one-light',
      dark: 'one-dark-pro',
    },
    transformers,
  })
}

export function CodeBlock(props: CodeBlockProps) {
  const {
    code,
    language,
    showLineNumbers = false,
    title,
    langLabel,
    showDots = true,
    className,
    children,
    ...rest
  } = props
  const [html, setHtml] = useState<string>('')
  const label =
    langLabel ?? (typeof language === 'string' ? language : 'code')

  useEffect(() => {
    let cancelled = false
    highlightCode(code, language, showLineNumbers).then((next) => {
      if (!cancelled) {
        setHtml(next)
      }
    })
    return () => {
      cancelled = true
    }
  }, [code, language, showLineNumbers])

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        data-slot='youbox-code-block'
        className={cn(
          'bg-code text-foreground border-code-border relative w-full overflow-hidden rounded-lg border font-mono',
          className
        )}
        {...rest}
      >
        <div className='border-code-border bg-surface-inset flex h-[38px] items-center gap-2.5 border-b px-3.5'>
          {showDots && (
            <span aria-hidden='true' className='flex items-center gap-1.5'>
              <i className='bg-muted-foreground/40 size-2.5 rounded-full' />
              <i className='bg-muted-foreground/40 size-2.5 rounded-full' />
              <i className='bg-muted-foreground/40 size-2.5 rounded-full' />
            </span>
          )}
          <span className='text-muted-foreground font-mono text-[11px] font-medium tracking-[0.06em] uppercase'>
            {label}
          </span>
          {title != null && (
            <span className='text-muted-foreground truncate font-mono text-xs'>
              {title}
            </span>
          )}
          <span className='flex-1' />
          <CodeBlockCopyButton className='h-[26px] gap-1.5 rounded-sm border px-2.5 font-mono text-[11px]' />
        </div>
        <div className='relative'>
          <div
            className='[&>pre]:bg-code! [&>pre]:text-foreground! overflow-auto [&_code]:font-mono [&_code]:text-sm [&_code]:leading-relaxed [&>pre]:m-0 [&>pre]:p-4 [&>pre]:text-sm'
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {children != null && (
            <div className='absolute top-2 right-2 flex items-center gap-2'>
              {children}
            </div>
          )}
        </div>
      </div>
    </CodeBlockContext.Provider>
  )
}

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

export function CodeBlockCopyButton(props: CodeBlockCopyButtonProps) {
  const { t } = useTranslation()
  const {
    onCopy,
    onError,
    timeout = 1400,
    children,
    className,
    ...rest
  } = props
  const [isCopied, setIsCopied] = useState(false)
  const { code } = useContext(CodeBlockContext)

  const copyToClipboard = async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'))
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      onCopy?.()
      setTimeout(() => setIsCopied(false), timeout)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className={cn(
        'text-muted-foreground hover:text-foreground border-border hover:border-border-strong shrink-0',
        isCopied && 'text-success border-success',
        className
      )}
      onClick={copyToClipboard}
      {...rest}
    >
      {children ??
        (isCopied ? (
          <>
            <CheckIcon className='size-3.5' aria-hidden />
            {t('Copied')}
          </>
        ) : (
          <>
            <CopyIcon className='size-3.5' aria-hidden />
            {t('Copy')}
          </>
        ))}
    </Button>
  )
}
