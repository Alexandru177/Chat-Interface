'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/(chat)/chat-list'
import { ChatPanel } from '@/components/(chat)/chat-panel'
import { ModelCard } from '@/components/(chat)/model-card'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { type AI } from '@/lib/chat'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import ModelSelect from './model-select'
import ModelOptions from './model-options'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [messages] = useUIState<typeof AI>()
  const [aiState] = useAIState<typeof AI>()
  const [modelKey, setModelKey] = useLocalStorage(
    'lastModel',
    aiState.model.id
      ? {
          id: aiState.model.id as string,
          type: aiState.model.provider ? 'local' : 'remote'
        }
      : null
  )

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, session?.user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      //new chat
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)

    aiState.model.options = {}
    if (modelKey?.type === 'local') {
      const data = JSON.parse(localStorage.getItem(modelKey.id) ?? '{}')
      Object.assign(aiState.model, {
        id: modelKey.id,
        provider: data.provider,
        apiKey: data.apiKey,
        apiURL: data.apiURL
      })
    } else
      Object.assign(aiState.model, {
        id: modelKey?.id,
        provider: '',
        apiKey: '',
        apiURL: ''
      })
  }, [modelKey])

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div className="flex justify-between w-full h-10 sticky top-0 z-10 bg-gradient-to-b from-background/80 from-100% to-background/30 to-0%">
        <ModelSelect
          modelKey={modelKey}
          setModelKey={setModelKey}
          className="ml-5 w-[400px]"
        />
        <ModelOptions />
      </div>
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} session={session} />
        ) : (
          <ModelCard modelKey={modelKey} />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}
