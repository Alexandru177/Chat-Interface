import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { CodeBlock } from './codeblock'
import { cn } from '@/lib/utils'

interface MemoizedReactMarkdownProps {
  children: string
  className?: string
}

export const MemoizedReactMarkdown = memo<MemoizedReactMarkdownProps>(
  ({ children, className }) => (
    <ReactMarkdown
      className={cn(
        'prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0',
        className
      )}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p({ children }: any) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')

          return match ? (
            <CodeBlock
              key={Math.random()}
              language={match[1]}
              code={String(children).replace(/\n$/, '')}
              highlight={[1, 2, 7, 9, 10, 13, 14, 15]}
              {...props}
            />
          ) : (
            <code
              {...props}
              className={cn(
                className,
                'px-1 py-0.5 text-rare bg-muted font-mono text-sm rounded-md'
              )}
            >
              {children}
            </code>
          )
        }
      }}
    >
      {children}
    </ReactMarkdown>
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
)
