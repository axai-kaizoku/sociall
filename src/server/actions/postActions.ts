"use server"

import { type PostData } from "@/lib/types"
import { validateRequest } from "../auth"
import { db } from "../db"
import { postTable } from "../db/schema"
import { createPostSchema } from "../db/validation"

export async function submitPost(input: string) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const { content } = createPostSchema.parse({ content: input })

  // const insertedPost = db
  //   .$with("inserted_post")
  //   .as(
  //     db
  //       .insert(postTable)
  //       .values({ content: content, userId: user.id })
  //       .returning()
  //   )

  // // Now use that CTE and join it with the user table
  // const result = await db
  //   .with(insertedPost)
  //   .select({
  //     postId: insertedPost.id,
  //     content: insertedPost.content,
  //     createdAt: insertedPost.createdAt,
  //     user: {
  //       id: userTable.id,
  //       username: userTable.username,
  //       avatarUrl: userTable.avatarUrl,
  //     },
  //   })
  //   .from(insertedPost)
  //   .innerJoin(userTable, eq(insertedPost.userId, userTable.id))

  const [insertedPost] = await db
    .insert(postTable)
    .values({
      content: content,
      userId: user.id,
    })
    .returning()

  if (!insertedPost) {
    throw Error("Failed to create post")
  }

  const result = await db.query.postTable.findFirst({
    where: (posts, { eq }) => eq(posts.id, insertedPost.id),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  })

  return result as PostData
}
