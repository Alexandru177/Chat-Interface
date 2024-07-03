import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
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
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        code({ node, className, children, ...props }) {
          if (children.length) {
            if (children[0] == '▍') {
              return (
                <span className="mt-1 animate-pulse cursor-default">▍</span>
              )
            }

            children[0] = (children[0] as string).replace('`▍`', '▍')
          }

          const match = /language-(\w+)/.exec(className || '')

          return match ? (
            <CodeBlock
              key={Math.random()}
              language={match[1] || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          ) : (
            <code
              {...props}
              className={cn(
                className,
                'px-1 py-0.5 rounded-md text-sm bg-secondary text-amber-300 dark:text-cyan-500 font-mono'
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
