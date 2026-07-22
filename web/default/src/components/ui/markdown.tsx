import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { cn, slugifyHeading } from '@/lib/utils'

interface MarkdownProps {
  children: string
  className?: string
  /**
   * Add slugified `id` attributes to h2/h3 headings so anchor links
   * (e.g. the legal document TOC rail) can target them. (R2-B15)
   */
  withHeadingIds?: boolean
}

function headingText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }
      if (isValidElement(child)) {
        return headingText((child.props as { children?: ReactNode }).children)
      }
      return ''
    })
    .join('')
}

const headingIdComponents: Components = {
  h2: ({ node: _node, children, ...props }) => (
    <h2
      id={slugifyHeading(headingText(children))}
      className='scroll-mt-24'
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <h3
      id={slugifyHeading(headingText(children))}
      className='scroll-mt-24'
      {...props}
    >
      {children}
    </h3>
  ),
}

export function Markdown({
  children,
  className,
  withHeadingIds,
}: MarkdownProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
        'prose-p:leading-relaxed prose-p:my-2',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-muted prose-pre:border',
        'prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-1',
        'prose-table:border prose-thead:bg-muted',
        'prose-td:border prose-th:border prose-td:px-3 prose-th:px-3',
        'prose-img:rounded-lg prose-img:shadow-sm',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        '[overflow-wrap:anywhere] break-words',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // 自定义组件渲染（可选）
          a: ({ node, ...props }) => (
            <a {...props} target='_blank' rel='noopener noreferrer' />
          ),
          ...(withHeadingIds ? headingIdComponents : {}),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
