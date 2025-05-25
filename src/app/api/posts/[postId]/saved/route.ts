import type { SavedInfo } from "@/lib/types"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { savedTable } from "@/server/db/schema"
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

    const savedPost = await db.query.savedTable.findFirst({
      where: and(
        eq(savedTable.userId, loggedInUser.id),
        eq(savedTable.postId, postId)
      ),
    })

    const data: SavedInfo = {
      isSavedByUser: !!savedPost,
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

    await db
      .insert(savedTable)
      .values({
        userId: loggedInUser?.id,
        postId,
      })
      .onConflictDoNothing({
        target: [savedTable.postId, savedTable.userId],
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

    await db
      .delete(savedTable)
      .where(
        and(
          eq(savedTable.userId, loggedInUser.id),
          eq(savedTable.postId, postId)
        )
      )

    return new Response()
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
