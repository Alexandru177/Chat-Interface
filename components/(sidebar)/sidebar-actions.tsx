'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'

import { type Chat } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { IconShare, IconSpinner, IconTrash } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { formatDate } from '@/lib/utils'
import { removeChat, shareChat } from '@/lib/db/actions.mongo'

interface SidebarActionsProps {
  chat: Chat
}

export function SidebarActions({ chat }: SidebarActionsProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [isSharePending, startShareTransition] = React.useTransition()

  const copyShareLink = React.useCallback(
    async (link: string) => {
      if (!link) {
        return toast.error('Could not copy share link to clipboard')
      }

      const url = new URL(window.location.href)
      url.pathname = link
      copyToClipboard(url.toString())
      setShareDialogOpen(false)
      toast.success('Share link copied to clipboard')
    },
    [copyToClipboard, setShareDialogOpen]
  )

  return (
    <>
      {!chat.sharePath && (
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="size-7 p-0"
                onClick={() => setShareDialogOpen(true)}
              >
                <IconShare />
                <span className="sr-only">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share chat</TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share link to chat</DialogTitle>
              <DialogDescription>
                Anyone with the URL will be able to view the shared chat.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 space-y-1 text-sm border rounded-md">
              <div className="font-medium">{chat.title}</div>
              <div className="text-muted-foreground">
                {formatDate(chat.updatedAt!)} ⚬ {chat.messagesLength} messages
              </div>
            </div>
            <DialogFooter className="items-center">
              <Button
                disabled={isSharePending}
                onClick={() =>
                  startShareTransition(async () => {
                    const path = `share/${chat.id}`
                    const result = await shareChat(chat.id, path)

                    if (result && 'error' in result) {
                      toast.error(result.error)
                      return
                    }

                    copyShareLink(path)
                  })
                }
              >
                {isSharePending ? (
                  <>
                    <IconSpinner className="mr-2 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <p>Copy link</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-7 p-0"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={e => {
                e.preventDefault()
                startRemoveTransition(async () => {
                  const result = await removeChat({
                    id: chat.id,
                    path: `chat/${chat.id}`
                  })

                  if (result && 'error' in result) {
                    toast.error(result.error)
                    return
                  }

                  setDeleteDialogOpen(false)
                  router.refresh()
                  router.push('/')
                  toast.success('Chat deleted')
                })
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
