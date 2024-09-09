import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createOpenAI } from '@ai-sdk/openai'

import {
  UserMessage,
  BotMessage,
  SystemMessage,
  SpinnerMessage
} from '@/components/utils'

import { z } from 'zod'
import { nanoid } from '@/lib/utils'
import { Chat, Message, NaturalMessage } from '@/lib/types'
import { auth } from '@/auth'
import { saveChat } from '@/lib/db/actions.mongo'

const lmstudio = createOpenAI({
  apiKey: process.env.API_KEY ?? '',
  baseURL: 'http://localhost:1234/v1'
})

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
} // as singular

async function submitUserMessage(
  content: string,
  messageId: string
): Promise<UIState> {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

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

  const result = await streamUI({
    model: lmstudio('gpt-3.5-turbo'),
    initial: <SpinnerMessage />,
    system: `You are a helpful assisant`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content
      }))
    ],
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
      } else {
        textStream.update(delta)
      }

      return textNode
    }
  })

  return {
    id: newId,
    display: result.value
  }
}

async function editUserMessage(
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

async function deleteUserMessage(messageId: string): Promise<void> {
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

//* Context
export const AI = createAI<AIState, UIState[]>({
  actions: {
    submitUserMessage,
    editUserMessage,
    deleteUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'
    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    //cb for setMessages of AI state.
    'use server'
    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const userId = session.user.id

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        messages
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Readonly<Chat>) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map(message => ({
      id: message.id,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return (
              <SystemMessage>Tool: {JSON.stringify(tool.result)}</SystemMessage>
            )
          })
        ) : message.role === 'user' ? (
          <UserMessage message={message} />
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage message={{ ...message, content: message.content }} />
        ) : null
    }))
}
