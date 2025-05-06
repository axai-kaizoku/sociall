import { db } from "@/server/db"
import { mediaTable } from "@/server/db/schema"
import { and, inArray, isNull, lte } from "drizzle-orm"
import { UTApi } from "uploadthing/server"

export async function GET() {
  try {
    const unusedMedia = await db
      .select({
        id: mediaTable.id,
        url: mediaTable.url,
      })
      .from(mediaTable)
      .where(
        and(
          isNull(mediaTable.postId),
          lte(mediaTable.createdAt, new Date(Date.now() - 1000 * 60 * 60 * 24))
        )
      )

    console.log("Found unused media:", unusedMedia)

    if (unusedMedia.length === 0) {
      return Response.json({ message: "No unused media to delete" })
    }

    const unusedMediaKeys = unusedMedia
      .map((media) => media?.url?.split("/f/")[1])
      .filter(Boolean)

    const utResponse = await new UTApi().deleteFiles(
      unusedMediaKeys as string[]
    )
    console.log("UT Delete Response:", utResponse)

    await db.delete(mediaTable).where(
      inArray(
        mediaTable.id,
        unusedMedia.map((m) => m?.id)
      )
    )

    console.log("DELETED UNUSED MEDIA ✅")

    return new Response("Success")
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
