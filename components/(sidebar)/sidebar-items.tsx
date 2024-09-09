'use client'

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { SidebarActions } from '@/components/(sidebar)/sidebar-actions'
import { SidebarItem } from '@/components/(sidebar)/sidebar-item'

interface SidebarItemsProps {
  chats?: Chat[]
}

function groupChatsByDate(chats: Chat[]) {
  function getCategory(date: Date, now: Date): string {
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfToday.getDate() - 1)

    if (date >= startOfToday) return 'Today'
    if (date >= startOfYesterday) return 'Yesterday'

    const day = 24 * 3600 * 1000,
      diff = now.getTime() - date.getTime()

    if (diff < 14 * day) return `${Math.floor(diff / day) + 1} days ago`
    if (diff < 30 * day) return 'This month'
    if (diff < 365 * day)
      return date.toLocaleString('default', { month: 'long' })
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const grouped = new Map<string, Chat[]>()
  chats
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .forEach(chat => {
      const date = chat.updatedAt!
      const category = getCategory(date, new Date())

      if (!grouped.has(category)) {
        grouped.set(category, [])
      }

      grouped.get(category)!.push(chat)
    })

  return grouped
}

export function SidebarItems({ chats }: SidebarItemsProps) {
  if (!chats?.length) return null

  const groupedChats = groupChatsByDate(chats)

  return (
    <AnimatePresence>
      {Array.from(groupedChats.entries()).map(([category, chats]) => (
        <div key={category} className="mt-2">
          <h3 className="text-muted-foreground text-xs font-medium mx-2 mb-2">
            {category}
          </h3>
          {chats.map((chat, index) => (
            <motion.div
              key={chat.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem key={chat.id} index={index} chat={chat}>
                <SidebarActions chat={chat} />
              </SidebarItem>
            </motion.div>
          ))}
        </div>
      ))}
    </AnimatePresence>
  )
}
