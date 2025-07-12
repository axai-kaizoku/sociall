import { Button } from "@/components/ui/button"
import { Bell, Bookmark, HomeIcon, Mail } from "lucide-react"
import Link from "next/link"
import { NotificationsButton } from "./notifications-button"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { notificationTable } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"

export const MenuBar = async ({ className }: { className?: string }) => {
  const { user } = await validateRequest()

  if (!user) return null

  const unreadNotificationCount = await db.query.notificationTable.findMany({
    where: and(
      eq(notificationTable.recipientId, user.id),
      eq(notificationTable.read, false)
    ),
  })

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
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Messages"
        asChild
      >
        <Link href="/messages">
          <Mail />
          <span className="hidden lg:inline">Messages</span>
        </Link>
      </Button>
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
