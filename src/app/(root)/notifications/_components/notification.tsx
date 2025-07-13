import { UserAvatar } from "@/components/user/user-avatar"
import type { NotificationData } from "@/lib/types"
import { atUrl, cn } from "@/lib/utils"
import type { Notification as NotificationType } from "@/server/db/schema"
import { Heart, MessageCircle, User2 } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

export const Notification = ({
  notification,
}: {
  notification: NotificationData
}) => {
  const notificationTypeMap: Record<
    NotificationType["type"],
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification?.issuer?.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: atUrl(notification?.issuer?.username),
    },
    COMMENT: {
      message: `${notification?.issuer?.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 text-primary fill-primary" />,
      href: `/posts/${notification?.postId}`,
    },
    LIKE: {
      message: `${notification?.issuer?.displayName} liked your post`,
      icon: <Heart className="size-7 text-red-500 fill-red-500" />,
      href: `/posts/${notification?.postId}`,
    },
  }

  const { message, href, icon } = notificationTypeMap[notification.type]
  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification?.issuer?.avatarUrl} size={36} />
          <div>
            <span className="font-bold">
              {notification?.issuer?.displayName}
            </span>{" "}
            <span>{message}</span>
          </div>
          {notification?.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification?.post?.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
