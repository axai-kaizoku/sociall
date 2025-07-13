import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { notificationTable } from "@/server/db/schema"
import { and, eq, lt } from "drizzle-orm"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor")

    const pageSize = 10

    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const whereClause = cursor
      ? lt(notificationTable.createdAt, new Date(cursor))
      : undefined

    const notifications = await db.query.notificationTable.findMany({
      where: and(whereClause, eq(notificationTable.recipientId, user.id)),
      orderBy: (notificationTable, { desc }) => [
        desc(notificationTable.createdAt),
      ],
      limit: pageSize + 1,
      with: {
        issuer: {
          columns: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        post: {
          columns: {
            content: true,
          },
        },
      },
    })

    const hasNextPage = notifications.length > pageSize
    const dataNotifications = hasNextPage
      ? notifications.slice(0, pageSize)
      : notifications
    const nextCursor = hasNextPage
      ? dataNotifications[dataNotifications.length - 1]?.createdAt.toISOString()
      : null

    const data = {
      notifications: dataNotifications,
      nextCursor,
    }

    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
