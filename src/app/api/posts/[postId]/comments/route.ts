import type { CommentsPage } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { commentTable } from "@/server/db/schema"
import { lt } from "drizzle-orm"
import type { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const postId = (await params).postId

    const cursor = req.nextUrl.searchParams.get("cursor")

    const pageSize = 5

    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const whereClause = cursor
      ? lt(commentTable.createdAt, new Date(cursor))
      : undefined

    const comments = await db.query.commentTable.findMany({
      where: (comments, { eq, and }) =>
        and(eq(comments.postId, postId), whereClause ?? undefined),
      orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      limit: pageSize + 1,
      with: {
        user: {
          with: {
            followers: {
              where: (follows, { eq }) => eq(follows.followerId, user.id),
              columns: {
                followerId: true,
              },
            },
          },
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
      },
    })

    const hasNextPage = comments.length > pageSize
    const data = hasNextPage ? comments.slice(0, pageSize) : comments
    const previousCursor = hasNextPage
      ? data[data.length - 1]?.createdAt.toISOString()
      : null

    const response: CommentsPage = {
      comments: data.reverse(),
      previousCursor: previousCursor!,
    }

    return Response.json(response)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
