import { db } from "@/server/db"
import { followTable, postTable } from "@/server/db/schema"
import { validateRequest } from "../auth"
import { cache } from "react"
import { notFound } from "next/navigation"
import { eq, sql } from "drizzle-orm"

export const usersToFollow = cache(async () => {
  const { user } = await validateRequest()

  if (!user) {
    return null
  }

  const res = await db.query.userTable.findMany({
    where: (users, { and, not, eq, exists }) =>
      and(
        not(eq(users.id, user.id)),
        not(
          exists(
            db
              .select()
              .from(followTable)
              .where(
                and(
                  eq(followTable.followerId, user.id),
                  eq(followTable.followingId, users.id)
                )
              )
          )
        )
      ),
    columns: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
    with: {
      followers: {
        where: (follows, { eq }) => eq(follows.followerId, user.id),
        columns: {
          followerId: true,
        },
      },
    },
    limit: 5,
  })

  return res
})

export const getUser = cache(
  async (username: string, loggedInUserId: string) => {
    const user = await db.query.userTable.findFirst({
      where: (users, { ilike }) => ilike(users.username, username),
      with: {
        followers: {
          where: (follows, { eq }) => eq(follows.followerId, loggedInUserId),
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
    })

    if (!user) notFound()

    const res = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(postTable)
      .where(eq(postTable.userId, user.id))
      .then((res) => res[0])

    return { ...user, postCount: res?.count }
  }
)
