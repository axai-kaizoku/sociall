import { deleteComment, submitComment } from "@/server/actions/commentActions"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { type CommentsPage } from "../types"

export function useSubmitCommentMutation(postId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId]

      await queryClient.cancelQueries({ queryKey })

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0]

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  previousCursor: firstPage.previousCursor,
                  comments: [...firstPage.comments, newComment],
                },
                ...oldData.pages.slice(1),
              ],
            }
          }
        }
      )

      await queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data
        },
      })

      toast.success("Comment created")
    },
    onError(error) {
      console.error(error)
      toast.error("Failed to submit comment. Please try again.")
    },
  })

  return mutation
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      const queryKey: QueryKey = ["comments", deletedComment.postId]

      await queryClient.cancelQueries({ queryKey })

      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter((c) => c.id !== deletedComment.id),
            })),
          }
        }
      )

      toast.success("Comment deleted")
    },
    onError(error) {
      console.error(error)
      toast.error("Failed to delete comment. Please try again.")
    },
  })

  return mutation
}
