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

    title: { type: String, required: true },
    messages: [messageSchema], // Array of Message documents

    path: { type: String },
    sharePath: { type: String },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users', // the name of the model you're referencing
      required: true
    }
  },
  { timestamps: true }
)

// Create the Chat model
const Chats = models.Chats || model<Chat>('Chats', chatSchema)

export default Chats
