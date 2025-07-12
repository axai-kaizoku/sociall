"use server"

import type { CommentData, PostData } from "@/lib/types"
import { validateRequest } from "../auth"
import { createCommentSchema } from "../db/validation"
import { db } from "../db"
import { commentTable } from "../db/schema"
import { eq } from "drizzle-orm"

export async function submitComment(input: {
  post: PostData
  content: string
}) {
  const { user } = await validateRequest()

  if (!user) throw new Error("Unauthorized")

  const { content } = createCommentSchema.parse(input)

  const result = await db.transaction(async (tx) => {
    const [insertedComment] = await tx
      .insert(commentTable)
      .values({
        content: content,
        postId: input.post.id,
        userId: user.id,
      })
      .returning()

    if (!insertedComment) {
      throw new Error("Failed to create comment")
    }

    const commentWithRelations = await tx.query.commentTable.findFirst({
      where: (comments, { eq }) => eq(comments.id, insertedComment.id),
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
      },
    })

    if (!commentWithRelations) {
      throw new Error("Failed to retrieve comment with relations")
    }

    return commentWithRelations
  })

  console.log(result, "submitComment")

  return result as CommentData
}

export async function deleteComment(input: { id: string }) {
  const { user } = await validateRequest()

  if (!user) throw new Error("Unauthorized")

  const comment = await db.query.commentTable.findFirst({
    where: (cmtTable, { eq }) => eq(cmtTable.id, input.id),
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
    },
  })

  if (!comment) throw new Error("Comment not found")

  if (comment.userId !== user.id) {
    throw new Error("Unauthorized")
  }

  await db.transaction(async (tx) => {
    await tx.delete(commentTable).where(eq(commentTable.id, input.id))
  })

  return comment
}
