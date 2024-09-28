import 'server-only'

import { getMutableAIState, streamUI, createStreamableValue } from 'ai/rsc'
import { AI, UIState } from '.'

import { BotMessage, SpinnerMessage, SystemMessage } from '@/components/utils'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { Message, NaturalMessage } from '@/lib/types'
import { CoreMessage } from 'ai'
import { getModel } from './models'

export async function submitUserMessage(
  content: string | null,
  messageId: string
): Promise<UIState> {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  if (content)
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: messageId,
          role: 'user',
          content
        }
      ]
    })

  let textStream: ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode
  let newId = nanoid()
  const model = aiState.get().model

  const result = await streamUI({
    model: getModel(model),
    system: model.prompt,
    ...model.options,
    messages: [
      ...aiState.get().messages.map(message => ({
        role: message.role,
        content: message.content
      }))
    ] as CoreMessage[],
    initial: <SpinnerMessage />,
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = (
          <BotMessage
            message={
              {
                id: newId,
                role: 'assistant',
                content: textStream.value
              } as NaturalMessage
            }
          />
        )
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: newId,
              role: 'assistant',
              content
            }
          ]
        })
      } else textStream.update(delta)

      return textNode
    }
  }).catch(e => ({
    value: <SystemMessage>An error occurred: {e.message}</SystemMessage>
  }))

  return {
    id: newId,
    display: result.value
  }
}

export async function editUserMessage(
  content: string,
  messageId: string
): Promise<void> {
  'use server'
  const aiState = getMutableAIState<typeof AI>()

  const updatedMessages = aiState.get().messages.map((message: Message) => {
    if (message.id === messageId) {
      return { ...message, content } as Message
    }
    return message
  })

  aiState.done({
    ...aiState.get(),
    messages: updatedMessages
  })
}

export async function deleteUserMessage(messageId: string): Promise<void> {
  'use server'
  const aiState = getMutableAIState<typeof AI>()

  const updatedMessages = aiState
    .get()
    .messages.filter((message: Message) => message.id !== messageId)

  aiState.done({
    ...aiState.get(),
    messages: updatedMessages
  })
}
