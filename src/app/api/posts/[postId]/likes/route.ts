import type { LikeInfo } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { postTable } from "@/server/db/schema"
import { eq } from "drizzle-orm"

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
