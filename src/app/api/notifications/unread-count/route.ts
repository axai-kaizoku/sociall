import type { NotificationCountInfo } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { notificationTable } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const unreadCount = await db.query.notificationTable.findMany({
      where: and(
        eq(notificationTable.recipientId, user.id),
        eq(notificationTable.read, false)
      ),
    })

    const data: NotificationCountInfo = {
      unreadCount: unreadCount.length,
    }

    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
