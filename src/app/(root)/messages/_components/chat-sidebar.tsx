import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/providers/session-provider"
import { cn } from "@/lib/utils"
import { MailPlus, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  ChannelList,
  ChannelPreviewMessenger,
  useChatContext,
  type ChannelPreviewUIComponentProps,
} from "stream-chat-react"
import { NewChatDialog } from "./new-chat.dialog"
import { useQueryClient } from "@tanstack/react-query"

export const ChatSidebar = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const { user } = useSession()

  const queryClient = useQueryClient()

  const { channel } = useChatContext()

  useEffect(() => {
    if (channel?.id) {
      void queryClient.invalidateQueries({
        queryKey: ["unread-messages-count"],
      })
    }
  }, [channel?.id, queryClient])

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => {
      return (
        <ChannelPreviewMessenger
          {...props}
          onSelect={() => {
            props?.setActiveChannel?.(props.channel, props?.watchers)
            onClose()
          }}
        />
      )
    },
    [onClose]
  )

  return (
    <div
      className={cn(
        "size-full md:flex flex-col border-e md:w-72",
        open ? "flex" : "hidden"
      )}
    >
      <MenuHeader onClose={onClose} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user?.id] },
        }}
        showChannelSearch
        options={{
          state: true,
          presence: true,
          limit: 8,
        }}
        sort={{
          last_message_at: -1,
        }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [user?.id] } },
            },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  )
}

const MenuHeader = ({ onClose }: { onClose: () => void }) => {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
