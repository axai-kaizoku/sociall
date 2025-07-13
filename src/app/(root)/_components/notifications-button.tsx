"use client"

import { Button } from "@/components/ui/button"
import { kyInstance } from "@/lib/ky"
import type { NotificationCountInfo } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import Link from "next/link"

export const NotificationsButton = ({
  initialState,
}: {
  initialState: NotificationCountInfo
}) => {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  })

  return (
    <Button
      variant={"ghost"}
      className="flex px-3  items-center justify-start gap-3"
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell />
          {!!data?.unreadCount && (
            <span className="absolute -right-1.5 -top-1.5 rounded-full bg-primary text-primary-foreground px-1 text-[10px] font-medium tabular-nums">
              {data?.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Notifications</span>
      </Link>
    </Button>
  )
}
