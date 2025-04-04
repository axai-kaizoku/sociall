import { TrendsSidebar } from "@/components/common/trends-sidebar"
import { PostEditor } from "@/components/posts/editor/post-editor"
import { ForYouFeed } from "./_components/for-you-feed"

export default function HomePage() {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <ForYouFeed />
      </div>
      <TrendsSidebar />
    </main>
  )
}
