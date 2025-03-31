"use server"

import { validateRequest } from "../auth"
import { db } from "../db"
import { postTable } from "../db/schema"
import { createPostSchema } from "../db/validation"

export async function submitPost(input: string) {
  const { user } = await validateRequest()

  if (!user) throw Error("Unauthorized")

  const { content } = createPostSchema.parse({ content: input })

  await db.insert(postTable).values({ content: content, userId: user.id })
}
