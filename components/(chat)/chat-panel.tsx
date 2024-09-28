'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/(chat)/chat-form'
import { ButtonScrollToBottom } from '@/components/(chat)/button-scroll-to-bottom'
import { IconRefresh } from '@/components/ui/icons'
import { FooterText } from '@/components/(chat)/chat-footer'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat'
import { nanoid } from 'lib/utils'
import { UserMessage } from '@/components/utils/message'
export interface ChatPanelProps {
  id?: string
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({ id, isAtBottom, scrollToBottom }: ChatPanelProps) {
  const [aiState] = useAIState<typeof AI>()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions<typeof AI>()

  const exampleMessages = [
    {
      heading: 'Why was Marcus Aurelius',
      subheading: 'considered the philosopher king?'
    },
    {
      heading: `What's particularly interesting about`,
      subheading: `Nietzsche’s moral and political philosophy`
    }
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`p-4 cursor-pointer rounded-lg border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  index > 1 && 'hidden md:block'
                }`}
                onClick={async () => {
                  const id = nanoid()
                  const message =
                    exampleMessages[index].heading +
                    ' ' +
                    exampleMessages[index].subheading
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id,
                      display: (
                        <UserMessage
                          message={{
                            id,
                            content: message,
                            role: 'user'
                          }}
                        />
                      )
                    }
                  ])

                  const responseMessage = await submitUserMessage(message, id)

                  setMessages(currentMessages => [
                    ...currentMessages,
                    responseMessage
                  ])
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
                <div className="text-sm text-muted-foreground">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>
        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {id ? (
                <Button
                  variant="outline"
                  onClick={async () => {
                    let lastId: string = ''
                    for (let i = aiState.messages.length - 1; i >= 0; i--)
                      if (aiState.messages[i].role === 'user') {
                        lastId = aiState.messages[i].id
                        aiState.messages = aiState.messages.slice(0, i + 1)
                        break
                      }

                    setMessages(currentMessages =>
                      currentMessages.slice(
                        0,
                        currentMessages.findIndex(
                          message => message.id === lastId
                        ) + 1
                      )
                    )

                    const responseMessage = await submitUserMessage(
                      null,
                      lastId
                    )

                    setMessages(currentMessages => [
                      ...currentMessages,
                      responseMessage
                    ])
                  }}
                >
                  <IconRefresh className="mr-2" />
                  Regenerate
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="space-y-4 border-t bg-card px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
