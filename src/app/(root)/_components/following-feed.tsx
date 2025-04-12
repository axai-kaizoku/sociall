"use client"

import { InfiniteScrollContainer } from "@/components/common/infinite-scroll-container"
import { Post } from "@/components/posts/post"
import { PostsSkeleton } from "@/components/posts/posts.skeleton"
import { kyInstance } from "@/lib/ky"
import type { PostsPage } from "@/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export const FollowingFeed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/following",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  if (status === "pending") {
    return <PostsSkeleton />
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No posts found. Start following people to see their posts here.
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    )
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {/* {JSON.stringify(posts[1])} */}
      {posts?.map((post) => <Post key={post.id} post={post} />)}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  )
}
