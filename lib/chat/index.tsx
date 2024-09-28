import * as actions from './actions'
import { createAI, getAIState } from 'ai/rsc'

import { UserMessage, BotMessage, SystemMessage } from '@/components/utils'

import { nanoid } from '@/lib/utils'
import type { Chat, Message, Model } from '@/lib/types'
import { auth } from '@/auth'
import { saveChat } from '@/lib/db/actions.mongo'
import { model } from 'mongoose'

export type AIState = {
  id: string
  model: Model
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
} // as singular

export type Actions = typeof actions

//* AI client-server Context
export const AI = createAI<AIState, UIState[], Actions>({
  actions,
  initialUIState: [],
  initialAIState: {
    id: nanoid(),
    model: { id: '', options: {} },
    messages: []
  },
  onGetUIState: async () => {
    'use server'
    const session = await auth()

    if (!session?.user) return

    const aiState = getAIState()
    if (aiState) return getUIStateFromAIState(aiState)
  }, //cb for setMessages of AI state.
  onSetAIState: async ({ state }) => {
    'use server'
    const session = await auth()

    if (!session?.user) return

    const { id, messages, model } = state

    const userId = session.user.id

    const firstMessageContent = messages[0].content as string
    const title = firstMessageContent.substring(0, 100)

    const chat: Chat = {
      id,
      userId,
      model,
      title,
      messages
    }

    await saveChat(chat)
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
          <BotMessage message={message} />
        ) : null
    }))
}
