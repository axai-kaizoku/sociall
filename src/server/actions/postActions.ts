"use server"

import { type PostData } from "@/lib/types"
import { eq } from "drizzle-orm"
import { validateRequest } from "../auth"
import { db } from "../db"
import { postTable } from "../db/schema"
import { createPostSchema } from "../db/validation"

export async function submitPost(input: string) {
  const { user } = await validateRequest()

  if (!user) throw new Error("Unauthorized")

  const { content } = createPostSchema.parse({ content: input })

  const [insertedPost] = await db
    .insert(postTable)
    .values({
      content: content,
      userId: user.id,
    })
    .returning()

  if (!insertedPost) {
    throw new Error("Failed to create post")
  }

  const result = await db.query.postTable.findFirst({
    where: (posts, { eq }) => eq(posts.id, insertedPost.id),
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
        },
      },
    },
  })

  return result as unknown as PostData
}

export async function deletePost(id: string) {
  const { user } = await validateRequest()

  if (!user) throw new Error("Unauthorized")

  const post = await db.query.postTable.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
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
        },
      },
    },
  })

  if (!post) throw new Error("Post not found")

  if (post.userId !== user.id) throw new Error("Unauthorized")

  await db.delete(postTable).where(eq(postTable.id, id))

  return post
}
