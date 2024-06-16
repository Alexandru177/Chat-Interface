'use server'

import { signIn } from '@/auth'
import { ResultCode, HashSaltPass } from '@/lib/utils'
import { z } from 'zod'
import Users from '@/lib/db/models/user.model'
import { AuthError } from 'next-auth'
interface Result {
  type: string
  resultCode: ResultCode
}

export async function signup(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6)
    })
    .safeParse({
      email,
      password
    })

  if (parsedCredentials.success) {
    //Hashing and Salting the Password
    const { hashedPassword, salt } = await HashSaltPass(password)

    try {
      //create user
      const user = await Users.findOne({ email })

      if (user && user.password)
        return {
          type: 'error',
          resultCode: ResultCode.UserAlreadyExists
        }
      else if (user)
        await Users.updateOne({ email }, { password: hashedPassword, salt }) //user exists but password is missing
      else await Users.create({ email, password: hashedPassword, salt })

      //attempt sign in
      await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      return {
        type: 'success',
        resultCode: ResultCode.UserCreated
      }
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return {
              type: 'error',
              resultCode: ResultCode.InvalidCredentials
            }
          default:
            return {
              type: 'error',
              resultCode: ResultCode.UnknownError
            }
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError
        }
      }
    }
  } else {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    }
  }
}
