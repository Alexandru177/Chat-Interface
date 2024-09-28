import { Schema, model, models } from 'mongoose'
import type { Chat, Message } from '@/lib/types'

// Mongoose schema for Message
const messageSchema = new Schema<Message>(
  {
    id: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true }
  },
  { _id: false }
)

// Mongoose schema for Chat
const chatSchema = new Schema<Chat>(
  {
    id: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    model: {
      id: { type: String, required: true },
      provider: { type: String },
      prompt: { type: String },
      options: { type: Map, of: Schema.Types.Mixed }
    },
    title: { type: String, required: true },
    messages: [messageSchema], // Array of Message documents
    sharePath: { type: String }
  },
  { timestamps: true }
)

const Chats = models.Chats || model<Chat>('Chats', chatSchema)

export default Chats
