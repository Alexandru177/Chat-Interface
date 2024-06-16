import { clearChats, getChats } from '@/app/actionsMongo'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { Chat } from '@/lib/types'
import { m } from 'framer-motion'
import { cache } from 'react'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
  const chats: Chat[] = await getChats(userId)

  return chats.map(chat => ({
    id: chat.id,
    title: chat.title,
    path: chat.path,
    messages: chat.messages.map(message => ({
      id: message.id,
      role: message.role,
      content: message.content
    })),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    _id: chat._id.toString(),
    userId: chat.userId.toString()
  }))
})

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = await loadChats(userId)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            {/* @ts-ignore */}
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}
