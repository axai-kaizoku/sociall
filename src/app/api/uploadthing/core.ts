import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { userTable } from "@/server/db/schema"
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

      await db
        .update(userTable)
        .set({ avatarUrl: newAvatarUrl })
        .where(eq(userTable.id, metadata.user.id))

      return { avatarUrl: newAvatarUrl }
    }),
} satisfies FileRouter

export type AppFileRouter = typeof fileRouter
