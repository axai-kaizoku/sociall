import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { postTable, userTable } from "@/server/db/schema"
import { and, desc, eq, lt, sql } from "drizzle-orm"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // const q = req.nextUrl.searchParams.get("q") ?? ""
    // const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined

    // const searchQuery = q.split(" ").join(" & ")

    // const pageSize = 10

    // const { user } = await validateRequest()

    // if (!user) {
    //   return Response.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // // https://orm.drizzle.team/docs/guides/postgresql-full-text-search

    // // https://neon.com/postgresql/postgresql-indexes/postgresql-full-text-search

    // const whereClause = cursor
    //   ? lt(postTable.createdAt, new Date(cursor))
    //   : undefined

    // const searchData = await db.transaction(async (tx) => {
    //   const posts = await tx
    //     .select()
    //     .from(postTable)
    //     .where(
    //       sql`to_tsvector('english', ${postTable.content}) @@ plainto_tsquery('english', ${searchQuery})`
    //     )

    //   const usernames = await tx
    //     .select()
    //     .from(userTable)
    //     .where(
    //       sql`to_tsvector('english', ${userTable.displayName}) @@ plainto_tsquery('english', ${searchQuery})`
    //     )

    //   const displayNames = await tx
    //     .select()
    //     .from(userTable)
    //     .where(
    //       sql`to_tsvector('english', ${userTable.username}) @@ plainto_tsquery('english', ${searchQuery})`
    //     )
    //   return {
    //     posts,
    //     usernames,
    //     displayNames,
    //   }
    // })

    // const posts = await db.query.postTable.findMany({
    //   where: whereClause,
    //   orderBy: (postTable, { desc }) => [desc(postTable.createdAt)],
    //   limit: pageSize + 1,
    //   with: {
    //     user: {
    //       with: {
    //         followers: {
    //           where: (follows, { eq }) => eq(follows.followerId, user.id),
    //           columns: {
    //             followerId: true,
    //           },
    //         },
    //       },
    //       columns: {
    //         id: true,
    //         username: true,
    //         displayName: true,
    //         avatarUrl: true,
    //         bio: true,
    //         createdAt: true,
    //       },
    //     },
    //     likes: {
    //       columns: {
    //         userId: true,
    //       },
    //     },
    //     saved: {
    //       where: (saved, { eq }) => eq(saved.userId, user.id),
    //       columns: {
    //         userId: true,
    //       },
    //     },
    //     media: true,
    //     comments: true,
    //   },
    // })

    // // console.log(posts)

    // const hasNextPage = posts.length > pageSize
    // const dataPosts = hasNextPage ? posts.slice(0, pageSize) : posts
    // const nextCursor = hasNextPage
    //   ? dataPosts[dataPosts.length - 1]?.createdAt.toISOString()
    //   : null

    // const data = {
    //   posts: posts.slice(0, pageSize),
    //   nextCursor,
    // }

    // return Response.json(data)

    const q = req.nextUrl.searchParams.get("q") ?? ""
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined
    const pageSize = 10

    const { user } = await validateRequest()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchQuery = q.trim().split(" ").join(" & ")

    // Base time cursor clause
    const createdAtClause = cursor
      ? lt(postTable.createdAt, new Date(cursor))
      : undefined

    // Build full-text search across post and user fields
    const searchClause = sql`
  (
    to_tsvector('english', ${postTable.content}) ||
    to_tsvector('english', ${userTable.username}) ||
    to_tsvector('english', ${userTable.displayName}) ||
    to_tsvector('english', ${userTable.bio})
  ) @@ plainto_tsquery('english', ${searchQuery})
`

    // Fetch matching post IDs
    const matchingPostIds = await db
      .select({ id: postTable.id })
      .from(postTable)
      .innerJoin(userTable, eq(postTable.userId, userTable.id))
      .where(
        createdAtClause ? and(searchClause, createdAtClause) : searchClause
      )
      .orderBy(desc(postTable.createdAt))
      .limit(pageSize + 1)

    // Paginate
    const hasNextPage = matchingPostIds.length > pageSize
    const paginatedPostIds = hasNextPage
      ? matchingPostIds.slice(0, pageSize).map((p) => p.id)
      : matchingPostIds.map((p) => p.id)

    // Fetch full post data (with relations)
    const posts = await db.query.postTable.findMany({
      where: (fields, { inArray }) => inArray(fields.id, paginatedPostIds),
      with: {
        user: {
          with: {
            followers: {
              where: (follows, { eq }) => eq(follows.followerId, user.id),
              columns: { followerId: true },
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
          columns: { userId: true },
        },
        saved: {
          where: (saved, { eq }) => eq(saved.userId, user.id),
          columns: { userId: true },
        },
        media: true,
        comments: true,
      },
      orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    })

    const nextCursor = hasNextPage
      ? posts[posts.length - 1]?.createdAt.toISOString()
      : null

    return Response.json({
      posts,
      nextCursor,
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
