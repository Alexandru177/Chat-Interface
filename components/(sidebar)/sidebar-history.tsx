import * as React from 'react'

import Link from 'next/link'

import { cn, sleep } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { clearChats, getChats } from '@/lib/db/actions.mongo'
import { ClearHistory } from '@/components/(sidebar)/button-clear-history'
import { SidebarItems } from '@/components/(sidebar)/sidebar-items'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { Chat } from '@/lib/types'
import { cache } from 'react'
import { Separator } from '@radix-ui/react-dropdown-menu'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => await getChats(userId))

export async function SidebarList({ userId }: SidebarListProps) {
  const chats: Chat[] = await loadChats(userId)
  await sleep(2000)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
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

interface SidebarHistoryProps {
  userId?: string
}

export async function History({ userId }: SidebarHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h4 className=" font-medium">Chat History</h4>
      </div>
      <div className="mb-2 px-2">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-10 w-full justify-start px-4 shadow-none transition-colors bg-zinc-50 dark:bg-zinc-900'
          )}
        >
          <IconPlus className="-translate-x-2 stroke-2" />
          New Chat
        </Link>
      </div>
      <React.Suspense
        fallback={
          <div className="flex flex-col flex-1 mt-4 px-4 space-y-4 overflow-auto">
            <Skeleton className="h-4 w-[150px]" />
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(
              (_, i) => (
                <Skeleton key={i} className="w-full h-6 shrink-0" />
              )
            )}
            <Skeleton className="h-4 w-[100px]" />
            {Array.from({ length: Math.floor(Math.random() * 6) + 1 }).map(
              (_, i) => (
                <Skeleton key={i} className="w-full h-6 shrink-0" />
              )
            )}
          </div>
        }
      >
        <SidebarList userId={userId} />
      </React.Suspense>
    </div>
  )
}
