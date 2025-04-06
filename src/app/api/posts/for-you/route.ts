import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { postTable } from "@/server/db/schema"
import { lt } from "drizzle-orm"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursor = req.nextUrl.searchParams.get("cursor")

    const pageSize = 10

    const whereClause = cursor
      ? lt(postTable.createdAt, new Date(cursor))
      : undefined

    const posts = await db.query.postTable.findMany({
      where: whereClause,
      orderBy: (postTable, { desc }) => [desc(postTable.createdAt)],
      limit: pageSize + 1,
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    const hasNextPage = posts.length > pageSize
    const dataPosts = hasNextPage ? posts.slice(0, pageSize) : posts
    const nextCursor = hasNextPage
      ? dataPosts[dataPosts.length - 1]?.createdAt.toISOString()
      : null

    const data = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    }

    return Response.json(data)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
