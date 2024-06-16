import { Schema, model, models } from 'mongoose'
import type { User } from '@/lib/types'

const userSchema: Schema = new Schema<User>({
  name: {
    type: String
    // required: [true, 'Username is required!']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required!']
  },
  emailVerified: {
    type: Date
  },
  image: {
    type: String
  },
  password: {
    type: String
  },
  salt: {
    type: String
  }
})

const Users = models.Users || model<User>('Users', userSchema)

export default Users
