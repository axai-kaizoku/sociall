import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await db.query.postTable.findMany({
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      columns: { userId: false },
      orderBy: (postTable, { desc }) => [desc(postTable.createdAt)],
    })

    return Response.json(posts)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
