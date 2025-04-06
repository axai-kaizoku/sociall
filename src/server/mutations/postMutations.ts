"use client"

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryFilters,
} from "@tanstack/react-query"
import { submitPost } from "../actions/postActions"
import { toast } from "sonner"
import type { PostsPage } from "@/lib/types"

export function useSubmitPostMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>,
        Error,
        InfiniteData<PostsPage, string | null>,
        readonly unknown[]
      > = { queryKey: ["post-feed", "for-you"] }

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

      toast.success("Post created!")
    },
    onError(error) {
      console.error(error)
      toast.error("Failed to post. Please try again.")
    },
  })

  return mutation
}
