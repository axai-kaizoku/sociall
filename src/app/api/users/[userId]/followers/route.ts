import type { FollowerInfo } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { followTable } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId

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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId

    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db
      .insert(followTable)
      .values({
        followerId: loggedInUser.id,
        followingId: userId,
      })
      .onConflictDoNothing({
        target: [followTable.followerId, followTable.followingId],
      })

    return new Response()
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId

    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db
      .delete(followTable)
      .where(
        and(
          eq(followTable.followerId, loggedInUser.id),
          eq(followTable.followingId, userId)
        )
      )

    return new Response()
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
