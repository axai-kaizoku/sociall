import { TrendsSidebar } from "@/components/common/trends-sidebar"
import { PostEditor } from "@/components/posts/editor/post-editor"
import { Post } from "@/components/posts/post"
import { db } from "@/server/db"
import { postTable, userTable } from "@/server/db/schema"
import { desc, eq } from "drizzle-orm"

export default async function HomePage() {
  const posts = await db
    .select({
      id: postTable.id,
      content: postTable.content,
      createdAt: postTable.createdAt,
      user: {
        id: userTable.id,
        username: userTable.username,
        displayName: userTable.displayName,
        avatarUrl: userTable.avatarUrl,
      },
    })
    .from(postTable)
    .leftJoin(userTable, eq(postTable.userId, userTable.id))
    .orderBy(desc(postTable.createdAt))

  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />

        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <TrendsSidebar />
    </main>
  )
}
