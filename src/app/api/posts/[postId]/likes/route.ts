import type { LikeInfo } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { likeTable, notificationTable, postTable } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const postId = (await params).postId

    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await db.query.postTable.findFirst({
      where: eq(postTable.id, postId),
      with: {
        likes: {
          where: (likes, { eq }) => eq(likes.userId, loggedInUser.id),
          columns: {
            userId: true,
          },
        },
      },
    })

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    const data: LikeInfo = {
      likes: post?.likes?.length,
      isLikedByUser: !!post?.likes?.length,
    }

    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const postId = (await params).postId

    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await db.query.postTable.findFirst({
      where: eq(postTable.id, postId),
      columns: {
        userId: true,
      },
    })

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(likeTable)
        .values({
          userId: loggedInUser?.id,
          postId,
        })
        .onConflictDoNothing({
          target: [likeTable.postId, likeTable.userId],
        })

      if (loggedInUser.id !== post.userId) {
        await tx.insert(notificationTable).values({
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        })
      }
    })

    return new Response()
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const postId = (await params).postId

    const { user: loggedInUser } = await validateRequest()

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await db.query.postTable.findFirst({
      where: eq(postTable.id, postId),
      columns: {
        userId: true,
      },
    })

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(likeTable)
        .where(
          and(
            eq(likeTable.userId, loggedInUser.id),
            eq(likeTable.postId, postId)
          )
        )

      await tx
        .delete(notificationTable)
        .where(
          and(
            eq(notificationTable.issuerId, loggedInUser.id),
            eq(notificationTable.recipientId, post.userId),
            eq(notificationTable.postId, postId),
            eq(notificationTable.type, "LIKE")
          )
        )
    })

    return new Response()
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
