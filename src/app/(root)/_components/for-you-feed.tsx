"use client"

import { Post } from "@/components/posts/post"
import type { PostData } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export const ForYouFeed = () => {
  const query = useQuery<PostData[]>({
    queryKey: ["post-feed", "for-you"],
    queryFn: async () => {
      const res = await fetch(`/api/posts/for-you`)

      if (!res.ok) {
        throw Error(`Request failed with status code ${res.status}`)
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res.json()
    },
  })

  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />
  }

  if (query.status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    )
  }

  return <>{query.data?.map((post) => <Post key={post.id} post={post} />)}</>
}
