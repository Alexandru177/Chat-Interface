'use client'

import { IconEdit, IconOpenAI, IconUser } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { spinner } from './spinner'
import { MemoizedReactMarkdown } from '../ui/markdown'
import { Button } from '../ui/button'
import type { StreamableValue } from 'ai/rsc'
import type { NaturalMessage } from 'lib/types'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { Copy, Delete, Edit } from './message-actions'
import { useState } from 'react'

export function UserMessage({
  message,
  className
}: {
  message: NaturalMessage
  className?: string
}) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={cn(
        'group/message relative flex items-start md:-ml-12',
        className
      )}
    >
      <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 w-full space-y-2 overflow-hidden pl-2">
        {isEditing && 'id' in message ? (
          <Edit message={message} setIsEditing={setIsEditing} />
        ) : (
          (message.content as string)
        )}

        <div
          className={`flex absolute ${isEditing ? 'bottom-0' : '-bottom-3.5'} right-0 transition-opacity group-hover/message:opacity-100 md:opacity-0`}
        >
          <Copy content={message.content as string} />
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="ghost"
            size="icon"
          >
            <IconEdit />
            <span className="sr-only">Edit message</span>
          </Button>
          <Delete messageId={message.id} />
        </div>
      </div>
    </div>
  )
}

export function BotMessage({
  message,
  className
}: {
  message: NaturalMessage & { content: StreamableValue<string> }
  className?: string
}) {
  const [text, setText] = useStreamableText(message.content)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={cn(
        'group/message relative flex items-start md:-ml-12',
        className
      )}
    >
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconOpenAI />
      </div>
      <div className="ml-4 w-full space-y-2 overflow-hidden px-1">
        {isEditing ? (
          <Edit
            message={{ ...message, content: text }}
            setIsEditing={setIsEditing}
            setText={setText}
          />
        ) : (
          <MemoizedReactMarkdown className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
            {text}
          </MemoizedReactMarkdown>
        )}
        <div
          className={`flex absolute ${isEditing ? 'bottom-0' : '-bottom-3.5'} right-0 transition-opacity group-hover/message:opacity-100 md:opacity-0`}
        >
          <Copy content={text} />
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="ghost"
            size="icon"
          >
            <IconEdit />
            <span className="sr-only">Edit message</span>
          </Button>
          <Delete messageId={message.id} />
        </div>
      </div>
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm',
          !showAvatar && 'invisible'
        )}
      >
        <IconOpenAI />
      </div>
      <div className="ml-4 flex-1 pl-2">{children}</div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
    </div>
  )
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconOpenAI />
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
    </div>
  )
}
