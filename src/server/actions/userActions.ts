"use server"

import { db } from "@/server/db"
import { followTable, postTable, userTable } from "@/server/db/schema"
import { validateRequest } from "../auth"
import { cache } from "react"
import { notFound } from "next/navigation"
import { eq, sql } from "drizzle-orm"
import {
  updateUserProfileSchema,
  type UpdateUserProfileValues,
} from "../db/validation"

export const awaitFor = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms)
    }, ms)
  })
}

export const fetchData1 = async (ms: number) => {
  await awaitFor(ms ?? 2000)
  return { data: { id: 1, name: "test" } }
}
export const fetchData2 = async (ms: number) => {
  await awaitFor(ms ?? 1000)
  return { data: { id: 2, name: "data 2" } }
}

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

export const updateUserProfile = async (input: UpdateUserProfileValues) => {
  const validatedValues = updateUserProfileSchema.parse(input)

  const { user } = await validateRequest()

  if (!user) throw new Error("Unauthorized")

  await db
    .update(userTable)
    .set({ ...validatedValues })
    .where(eq(userTable.id, user.id))

  const updatedUser = await db.query.userTable.findFirst({
    where: eq(userTable.id, user.id),
    with: {
      followers: {
        with: {
          followerUser: true, // gets full user data of each follower
        },
      },
    },
  })

  return updatedUser
}
