import {
  CoreMessage,
  CoreUserMessage,
  CoreAssistantMessage,
  CoreSystemMessage
} from 'ai'
import { mongo } from 'mongoose'

export type Message = CoreMessage & {
  id: string
}

//Message between user and assistant. Excludes tool calls
export type NaturalMessage = (
  | CoreUserMessage
  | CoreAssistantMessage
  | CoreSystemMessage
) & {
  id: string
}

export interface Chat extends Record<string, any> {
  id: string
  userId: any
  createdAt?: Date
  updatedAt?: Date
  title: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  image?: string
  salt?: string
}
