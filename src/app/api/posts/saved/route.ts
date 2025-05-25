import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor")

    const pageSize = 10

    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cursorDate = cursor ? new Date(cursor) : undefined

    const result = await db.transaction(async (tx) => {
      const savedPosts = await tx.query.savedTable.findMany({
        where: (savedTable, { eq, lt, and }) =>
          and(
            eq(savedTable.userId, user.id),
            cursorDate ? lt(savedTable.createdAt, cursorDate) : undefined
          ),
        orderBy: (savedTable, { desc }) => [desc(savedTable.createdAt)],
        limit: pageSize + 1,
        with: {
          post: {
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
              likes: {
                columns: {
                  userId: true,
                },
              },
              saved: {
                where: (saved, { eq }) => eq(saved.userId, user.id),
                columns: {
                  userId: true,
                },
              },
              media: true,
            },
          },
        },
      })

      const hasNextPage = savedPosts.length > pageSize
      const dataPosts = hasNextPage ? savedPosts.slice(0, pageSize) : savedPosts
      const nextCursor = hasNextPage
        ? dataPosts[dataPosts.length - 1]?.createdAt.toISOString()
        : null

      return {
        posts: dataPosts.map((saved) => saved.post),
        nextCursor,
      }
    })

    return Response.json(result)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
