import { env } from "@/env"
import { kyInstance } from "@/lib/ky"
import { useSession } from "@/lib/providers/session-provider"
import { useEffect, useState } from "react"
import { StreamChat } from "stream-chat"

export default function useInitializeChatClient() {
  const { user } = useSession()
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)

  useEffect(() => {
    const client = StreamChat.getInstance(env.NEXT_PUBLIC_STREAM_KEY)

    void client
      .connectUser(
        {
          id: user?.id,
          username: user?.username,
          name: user?.displayName,
          image: user?.avatarUrl ?? "",
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token)
      )
      .catch((err) => console.error("Failed to connect user", err))
      .then(() => setChatClient(client))

    return () => {
      setChatClient(null)
      void client
        .disconnectUser()
        .catch((err) => console.error("Failed to disconnect user", err))
        .then(() => console.log("Connection closed"))
    }
  }, [user?.id, user?.username, user?.displayName, user?.avatarUrl])
  return chatClient
}
