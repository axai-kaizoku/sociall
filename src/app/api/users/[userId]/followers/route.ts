import type { FollowerInfo } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
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

    // const followersCount = await db
    //   .select({ count: sql<number>`count(*)` })
    //   .from(followTable)
    //   .where(eq(followTable.followingId, userId))
    //   .then((res) => res[0]?.count)

    const data: FollowerInfo = {
      followers: user.followers.length,
      isFollowedByUser: !!user.followers.length,
    }

    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  return new Response("POST")
}
