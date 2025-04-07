"use server"

import { type PostData } from "@/lib/types"
import { validateRequest } from "../auth"
import { db } from "../db"
import { postTable } from "../db/schema"
import { createPostSchema } from "../db/validation"
import { eq } from "drizzle-orm"

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
  })

  if (!post) throw new Error("Post not found")

  if (post.userId !== user.id) throw new Error("Unauthorized")

  const [deletedPost] = await db
    .delete(postTable)
    .where(eq(postTable.id, id))
    .returning()

  if (!deletedPost) {
    throw new Error("Failed to delete post")
  }

  // const deletedPost = db
  //   .$with("deleted_post")
  //   .as(db.delete(postTable).where(eq(postTable.id, id)).returning())

  // Now use the CTE and join it with the user table
  // const [result] = await db
  //   .with(deletedPost)
  //   .select({
  //     id: deletedPost.id,
  //     content: deletedPost.content,
  //     createdAt: deletedPost.createdAt,
  //     user: {
  //       id: userTable.id,
  //       username: userTable.username,
  //       displayName: userTable.displayName,
  //       avatarUrl: userTable.avatarUrl,
  //     },
  //   })
  //   .from(deletedPost)
  //   .innerJoin(userTable, eq(deletedPost.userId, userTable.id))

  const result = await db.query.postTable.findFirst({
    where: (posts, { eq }) => eq(posts.id, deletedPost.id),
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

  return result
}
