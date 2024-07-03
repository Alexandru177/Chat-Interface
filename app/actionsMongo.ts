'use server'
//& Actions for MongoDB No-SQL Store. Current Implementation

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Chats from '@/lib/db/models/chat.model'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'
import { connectToDB } from '@/lib/db/mongoose'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'

connectToDB()

//* Create
export async function saveChat(chat: Chat) {
  const session = await auth()

  if (session && session.user) {
    await Chats.findOneAndUpdate({ id: chat.id }, chat, {
      upsert: true
    })
  }
  return
}

//* Read
export async function getChat(id: string, userId: string) {
  const chat = await Chats.findOne({
    id,
    userId: new ObjectId(userId)
  })

  if (!chat) {
    return null
  }

  return chat as Chat
}

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const chats: Chat[] = await Chats.find({ userId: new ObjectId(userId) })

    return chats
  } catch (error) {
    return []
  }
}

//* Delete
export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await Chats.findOneAndDelete({
    id,
    userId: new ObjectId(session?.user?.id)
  })

  if (!chat) {
    return {
      error: 'Unauthorized'
    }
  }

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await Chats.deleteMany({ userId: new ObjectId(session.user.id) })

  revalidatePath('/')
  return redirect('/')
}

//* Share Chat
export async function getSharedChat(id: string) {
  const chat = await Chats.findOne({ id })

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await Chats.findOne({
    id,
    userId: new ObjectId(session?.user?.id)
  })

  if (!chat) {
    return {
      error: 'Something went wrong'
    }
  }

  chat.sharePath = `/share/${chat.id}`

  await chat.save()

  return chat
}

//* Others
export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
