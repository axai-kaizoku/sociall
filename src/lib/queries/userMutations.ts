import { updateUserProfile } from "@/server/actions/userActions"
import type { UpdateUserProfileValues } from "@/server/db/validation"
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryFilters,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { PostData, PostsPage } from "../types"
import { useUploadThing } from "../uploadthing"

export function useUpdateProfileMutation() {
  const router = useRouter()

  const queryClient = useQueryClient()

  const { startUpload } = useUploadThing("avatar")

  const mutation = useMutation({
    mutationFn: async ({
      input,
      avatar,
    }: {
      input: UpdateUserProfileValues
      avatar?: File
    }) => {
      return Promise.all([
        updateUserProfile(input),
        avatar && startUpload([avatar]),
      ])
    },
    onSuccess: async ([updatedUser, uploadResult]) => {
      const newAvatarUrl = uploadResult?.[0]?.serverData?.avatarUrl

      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>,
        Error,
        InfiniteData<PostsPage, string | null>,
        readonly unknown[]
      > = {
        queryKey: ["post-feed"],
      }

      await queryClient.cancelQueries(queryFilter)

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return

          if (!updatedUser) return

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl ?? updatedUser.avatarUrl,
                    },
                  } as PostData
                }
                return post
              }),
            })),
          }
        }
      )

      router.refresh()

      toast.success("Profile updated")
    },
    onError(error) {
      console.error(error)
      toast.error("Failed to update profile. Please try again")
    },
  })

  return mutation
}
