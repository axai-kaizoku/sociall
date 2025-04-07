"use client"

import { useFollowerInfo } from "@/hooks/use-follower-info"
import { kyInstance } from "@/lib/ky"
import type { FollowerInfo } from "@/lib/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "./ui/button"

export const FollowButton = ({
  userId,
  initialState,
}: {
  userId: string
  initialState: FollowerInfo
}) => {
  const queryClient = useQueryClient()
  const { data } = useFollowerInfo({ userId, initialState })

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
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
