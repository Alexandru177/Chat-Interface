import { auth } from '@/auth'
import { History } from '@/components/(sidebar)/sidebar-history'
import { SidebarDesktop } from '@/components/(sidebar)/sidebar'
import { type Session } from '@/lib/types'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const session = (await auth()) as Session

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop>
        <History userId={session.user.id} />
      </SidebarDesktop>
      {children}
    </div>
  )
}
