import { Button } from "@/components/ui/button"
import { streamServerClient } from "@/lib/stream"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { notificationTable } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"
import { Bookmark, HomeIcon } from "lucide-react"
import Link from "next/link"
import { MessagesButton } from "./messages-button"
import { NotificationsButton } from "./notifications-button"

export const MenuBar = async ({ className }: { className?: string }) => {
  const { user } = await validateRequest()

  if (!user) return null

  const [unreadNotificationCount, unreadMessagesCount] = await Promise.all([
    db.query.notificationTable.findMany({
      where: and(
        eq(notificationTable.recipientId, user.id),
        eq(notificationTable.read, false)
      ),
    }),

    (await streamServerClient.getUnreadCount(user?.id)).total_unread_count,
  ])

  return (
    <div className={className}>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <HomeIcon />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationCount.length }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Saved"
        asChild
      >
        <Link href="/saved">
          <Bookmark />
          <span className="hidden lg:inline">Saved</span>
        </Link>
      </Button>
    </div>
  )
}
