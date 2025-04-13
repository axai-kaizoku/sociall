"use client"

import type { PostsPage } from "@/lib/types"
import { deletePost, submitPost } from "@/server/actions/postActions"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type Query,
  type QueryFilters,
} from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "../providers/session-provider"

export function useSubmitPostMutation() {
  const queryClient = useQueryClient()

  const { user } = useSession()

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>,
        Error,
        InfiniteData<PostsPage, string | null>,
        readonly unknown[]
      > = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          )
        },
      }

      await queryClient.cancelQueries(queryFilter)

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0]

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            }
          }
        }
      )

      await queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(
          query: Query<
            InfiniteData<PostsPage, string | null>,
            Error,
            InfiniteData<PostsPage, string | null>,
            readonly unknown[]
          >
        ) {
          return queryFilter?.predicate!(query) && !query.state.data
        },
      })

      toast.success("Post created!")
    },
    onError(error) {
      console.error(error)
      toast.error("Failed to post. Please try again.")
    },
  })

  return mutation
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()

  const router = useRouter()
  const pathname = usePathname()

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      if (!deletedPost) return

      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>,
        Error,
        InfiniteData<PostsPage, string | null>,
        readonly unknown[]
      > = { queryKey: ["post-feed"] }

      await queryClient.cancelQueries(queryFilter)

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          }
        }
      )

      toast.success("Post deleted")

      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`)
      }
    },
    onError(error) {
      console.error(error)
      toast.error("Failed to delete post. Please try again.")
    },
  })

  return mutation
}
