import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { userTable } from "@/server/db/schema"
import { ilike } from "drizzle-orm"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const username = (await params).username

    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.query.userTable.findFirst({
      where: ilike(userTable.username, username),
      with: {
        followers: {
          where: (follows, { eq }) => eq(follows.followerId, loggedInUser.id),
          columns: {
            followerId: true,
          },
        },
      },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json(user)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
