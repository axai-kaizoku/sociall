"use client"

import { useFollowerInfo } from "@/hooks/use-follower-info"
import { kyInstance } from "@/lib/ky"
import type { FollowerInfo } from "@/lib/types"
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { Button } from "./ui/button"
import { toast } from "sonner"

export const FollowButton = ({
  userId,
  initialState,
}: {
  userId: string
  initialState: FollowerInfo
}) => {
  const queryClient = useQueryClient()
  const { data } = useFollowerInfo({ userId, initialState })

  const queryKey: QueryKey = ["follower-info", userId]

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey)

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers ?? 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }))

      return { previousState }
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState)

      console.error(error)
      toast.error("Something went wrong. Please try again.")
    },
  })

  return (
    <Button
      onClick={() => mutate()}
      variant={data.isFollowedByUser ? "secondary" : "default"}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  )
}
