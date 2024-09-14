'use client'

import type { NaturalMessage } from 'lib/types'

import { Button } from '@/components/ui/button'
import { IconCheck, IconClose, IconCopy } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

import Textarea from 'react-textarea-autosize'
import { useState } from 'react'
import { useUIState, useActions } from 'ai/rsc'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import type { AI, UIState } from '@/lib/chat'
import { BotMessage, UserMessage } from './message'

interface CopyActionProps {
  content: string
}

export function Copy({ content }: CopyActionProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(content)
  }

  return (
    <Button variant="ghost" size="icon" onClick={onCopy}>
      {isCopied ? <IconCheck /> : <IconCopy />}
      <span className="sr-only">Copy message</span>
    </Button>
  )
}

interface DeleteActionProps {
  messageId: string
}

export function Delete({ messageId }: DeleteActionProps) {
  const { deleteUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={async () => {
        deleteUserMessage(messageId)
        setMessages((currentMessages: UIState[]) =>
          currentMessages.filter((msg: UIState) => msg.id !== messageId)
        )
      }}
    >
      <IconClose />
      <span className="sr-only">Delete message</span>
    </Button>
  )
}

interface EditActionProps {
  message: NaturalMessage
  setIsEditing: (isEditing: boolean) => void
  setText?: (text: string) => void
}

export function Edit({ message, setIsEditing, setText }: EditActionProps) {
  const [editText, setEditText] = useState<string>(message.content as string)
  const { formRef, onKeyDown } = useEnterSubmit()
  const { editUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()
        if (!editText) return

        editUserMessage(editText, message.id)

        setMessages((currentMessages: UIState[]) =>
          currentMessages.map((msg: UIState) => {
            if (msg.id === message.id) {
              return {
                id: message.id,
                display:
                  message.role === 'assistant' ? (
                    <BotMessage message={{ ...message, content: editText }} />
                  ) : (
                    <UserMessage message={{ ...message, content: editText }} />
                  )
              }
            }
            return msg
          })
        )

        if (message.role === 'assistant') setText!(editText) //re-render markdown
        setIsEditing(false)
      }}
    >
      <Textarea
        onKeyDown={onKeyDown}
        tabIndex={0}
        placeholder="Edit message..."
        className="min-h-[30px] w-full flex-1 resize-none bg-transparent focus-within:outline-none sm:text-sm overflow-hidden"
        style={{ fontSize: '16px', lineHeight: '26px' }}
        autoFocus
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        name="message"
        value={editText}
        onChange={e => setEditText(e.target.value)}
      />
      <div className="flex justify-center gap-2">
        <Button type="submit" size="sm">
          <IconCheck className="mr-2 h-3 w-3" /> Save
          <span className="sr-only">Save</span>
        </Button>
        <Button type="reset" size="sm" onClick={() => setIsEditing(false)}>
          Cancel
          <span className="sr-only">Cancel</span>
        </Button>
      </div>
    </form>
  )
}
