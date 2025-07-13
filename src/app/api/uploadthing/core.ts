import { streamServerClient } from "@/lib/stream"
import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { mediaTable, userTable } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError, UTApi } from "uploadthing/server"

const f = createUploadthing()

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest()

      if (!user) throw new UploadThingError("Unauthorized") as Error

      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata?.user?.avatarUrl

      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split("/f/")[1]

        await new UTApi().deleteFiles(key!)
      }

      const newAvatarUrl = file.ufsUrl

      await Promise.all([
        db
          .update(userTable)
          .set({ avatarUrl: newAvatarUrl })
          .where(eq(userTable.id, metadata.user.id)),

        streamServerClient.partialUpdateUser({
          id: metadata?.user?.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ])

      return { avatarUrl: newAvatarUrl }
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest()

      if (!user) throw new UploadThingError("Unauthorized") as Error

      return {}
    })
    .onUploadComplete(async ({ file }) => {
      const [media] = await db
        .insert(mediaTable)
        .values({
          url: file.ufsUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        })
        .returning()

      return { mediaId: media?.id }
    }),
} satisfies FileRouter

export type AppFileRouter = typeof fileRouter
