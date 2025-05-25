"use server"

import { type PostData } from "@/lib/types"
import { eq, inArray } from "drizzle-orm"
import { validateRequest } from "../auth"
import { db } from "../db"
import { mediaTable, postTable } from "../db/schema"
import { createPostSchema } from "../db/validation"
import { cache } from "react"
import { notFound } from "next/navigation"

export async function submitPost(input: {
  content: string
  mediaIds: string[]
}) {
  const { user } = await validateRequest()

  if (!user) throw new Error("Unauthorized")

  const { content, mediaIds } = createPostSchema.parse(input)

  // const [insertedPost] = await db
  //   .insert(postTable)
  //   .values({
  //     content: content,
  //     userId: user.id,
  //   })
  //   .returning()

  // if (!insertedPost) {
  //   throw new Error("Failed to create post")
  // }

  // const result = await db.query.postTable.findFirst({
  //   where: (posts, { eq }) => eq(posts.id, insertedPost.id),
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
  //       },
  //     },
  //     media: {
  //       columns: {
  //          id: true
  //       }
  //     }
  //   },
  // })

  const result = await db.transaction(async (tx) => {
    const [insertedPost] = await tx
      .insert(postTable)
      .values({
        content: content,
        userId: user.id,
      })
      .returning()

    if (!insertedPost) {
      throw new Error("Failed to create post")
    }

    if (mediaIds && mediaIds?.length > 0) {
      await tx
        .update(mediaTable)
        .set({ postId: insertedPost.id })
        .where(inArray(mediaTable.id, mediaIds))
    }

    const postWithRelations = await tx.query.postTable.findFirst({
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
            bio: true,
            createdAt: true,
          },
        },
        likes: {
          where: (likes, { eq }) => eq(likes.userId, user.id),
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
    })

    if (!postWithRelations) {
      throw new Error("Failed to retrieve post with relations")
    }

    return postWithRelations
  })

  console.log(result)

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
          bio: true,
          createdAt: true,
        },
      },
      likes: {
        where: (likes, { eq }) => eq(likes.userId, user.id),
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
  })

  if (!post) throw new Error("Post not found")

  if (post.userId !== user.id) throw new Error("Unauthorized")

  await db.delete(postTable).where(eq(postTable.id, id))

  return post
}

export const getPost = cache(
  async ({
    postId,
    loggedInUserId,
  }: {
    postId: string
    loggedInUserId: string
  }) => {
    // const post = await db.query
    const post = await db.query.postTable.findFirst({
      where: (posts, { eq }) => eq(posts.id, postId),
      with: {
        user: {
          with: {
            followers: {
              where: (follows, { eq }) =>
                eq(follows.followerId, loggedInUserId),
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
          where: (likes, { eq }) => eq(likes.userId, loggedInUserId),
          columns: {
            userId: true,
          },
        },
        saved: {
          where: (saved, { eq }) => eq(saved.userId, loggedInUserId),
          columns: {
            userId: true,
          },
        },
        media: true,
      },
    })

    if (!post) notFound()

    return post as unknown as PostData
  }
)
