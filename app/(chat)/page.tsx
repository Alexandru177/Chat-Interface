import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/(chat)/chat'
import { AI } from '@/lib/chat'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { getMissingKeys } from '@/lib/db/actions.mongo'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
