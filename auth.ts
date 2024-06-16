import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import { z } from 'zod'
import { HashSaltPass } from './lib/utils'

import Users from 'lib/db/models/user.model'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup'
  },
  callbacks: {
    //* authorizes and redirects user to home page
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup')

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL('/', nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id // Ensure this is the MongoDB ObjectId
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string // Ensure the session object includes the MongoDB ObjectId
      }
      return session
    },
    async signIn({ user, account, profile, credentials }) {
      const email = profile?.email || credentials?.email

      try {
        let existingUser = await Users.findOne({ email })

        if (account!.provider !== 'credentials') {
          //*Handle providers like Google, GitHub specifically
          if (!user)
            //Create new user
            existingUser = await Users.create({
              ...profile,
              emailVerified: new Date()
            })
          else if (user != profile)
            //Uppdate missing props
            await Users.updateOne({ email }, profile)
        }

        user.id = existingUser._id.toString()

        return true
      } catch (error) {
        return false
      }
    }
  },
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await Users.findOne({ email })

          if (!user) return null

          //Hashing and Salting the Password
          const { hashedPassword } = await HashSaltPass(password, user.salt)

          if (hashedPassword === user.password) return user
        }

        return null
      }
    })
  ]
})
