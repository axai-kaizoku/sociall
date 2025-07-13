import { env } from "@/env"
import { StreamChat } from "stream-chat"

export const streamServerClient = StreamChat.getInstance(
  env.NEXT_PUBLIC_STREAM_KEY,
  env.STREAM_SECRET
)
