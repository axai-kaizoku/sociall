import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { notificationTable } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"

export async function PATCH() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db
      .update(notificationTable)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notificationTable.recipientId, user.id),
          eq(notificationTable.read, false)
        )
      )

    return new Response()
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
