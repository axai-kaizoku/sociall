import { LoadingButton } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserAvatar } from "@/components/user/user-avatar"
import { useDebounce } from "@/hooks/use-debounce"
import { useSession } from "@/lib/providers/session-provider"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Check, Loader2, SearchIcon, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { UserResponse } from "stream-chat"
import type { DefaultStreamChatGenerics } from "stream-chat-react"
import { useChatContext } from "stream-chat-react"

export const NewChatDialog = ({
  onChatCreated,
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
  onChatCreated: () => void
}) => {
  const { client, setActiveChannel } = useChatContext()

  const { user: loggedInUser } = useSession()

  const [rawSearch, setRawSearch] = useState("")

  const searchInput = useDebounce(rawSearch)

  const [selectedUsers, setSelectedUsers] = useState<
    UserResponse<DefaultStreamChatGenerics>[]
  >([])

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInput],
    queryFn: async () => {
      const allUsers = await client.queryUsers(
        {
          ...(searchInput
            ? {
                $or: [
                  { name: { $autocomplete: searchInput } },
                  { username: { $autocomplete: searchInput } },
                ],
              }
            : {}),
        },
        {
          name: 1,
          user: 1,
        },
        { limit: 15 }
      )

      const filtered = allUsers?.users
        ?.filter((u) => u?.id !== loggedInUser.id)
        ?.filter((u) => u?.role !== "admin")

      console.log(filtered)

      return filtered
    },
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const channel = client.channel("messaging", {
        members: [loggedInUser?.id, ...selectedUsers.map((u) => u.id)],
        name:
          selectedUsers?.length > 1
            ? loggedInUser?.displayName +
              ", " +
              selectedUsers.map((u) => u.name).join(", ")
            : undefined,
      })

      await channel.create()
      return channel
    },
    onSuccess: (channel) => {
      setActiveChannel(channel)
      onChatCreated()
    },
    onError(error) {
      console.error("Error starting chat", error)
      toast.error("Error starting chat, please try again.")
    },
  })

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0 ">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="">
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input
              placeholder="Search users.."
              className="h-12 w-full pe-4 ps-14 focus:outline-none"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
            />
          </div>
          {!!selectedUsers?.length && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUsers?.map((user) => (
                <SelectedUserTag
                  key={user?.id}
                  user={user}
                  onRemove={() => {
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id)
                    )
                  }}
                />
              ))}
            </div>
          )}
          <hr />
          {/* {JSON.stringify(data)} */}
          <div className="h-96 overflow-y-auto">
            {isSuccess &&
              data?.map((user) => (
                <UserResult
                  key={user?.id}
                  user={user}
                  selected={selectedUsers.some((u) => u.id === user.id)}
                  onClick={() => {
                    //
                    setSelectedUsers((prev) =>
                      prev.some((u) => u.id === user?.id)
                        ? prev.filter((u) => u.id !== user?.id)
                        : [...prev, user]
                    )
                  }}
                />
              ))}
            {isSuccess && !data?.length && (
              <p className="my-3 text-center text-muted-foreground">
                No users found. Try a different name.
              </p>
            )}

            {isFetching && <Loader2 className="animate-spin mx-auto my-3" />}
            {isError && (
              <p className="my-3 text-center text-destructive">
                An error occurred while loading users.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <LoadingButton
            disabled={!selectedUsers?.length}
            loading={mutation?.isPending}
            onClick={() => mutation.mutate()}
          >
            Start Chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const UserResult = ({
  user,
  onClick,
  selected,
}: {
  user: UserResponse<DefaultStreamChatGenerics>
  selected: boolean
  onClick: () => void
}) => (
  <button
    className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50"
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <UserAvatar avatarUrl={user?.image} />
      <div className="flex flex-col text-start">
        <p className="font-bold">{user?.name}</p>
        <p className="text-muted-foreground">{`@${user?.username}`}</p>
      </div>
    </div>
    {selected && <Check className="size-5 text-green-500" />}
  </button>
)

const SelectedUserTag = ({
  onRemove,
  user,
}: {
  user: UserResponse<DefaultStreamChatGenerics>
  onRemove: () => void
}) => {
  return (
    <button
      className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
      onClick={onRemove}
    >
      <UserAvatar avatarUrl={user?.image} size={24} />
      <p className="font-bold">{user?.name}</p>
      <X className="size-5 mx-2 text-muted-foreground" />
    </button>
  )
}
