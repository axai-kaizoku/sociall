"use client"

import { useFollowerInfo } from "@/hooks/use-follower-info"
import type { FollowerInfo } from "@/lib/types"
import { formatNumber } from "@/lib/utils"

export const FollowerCount = ({
  userId,
  initialState,
}: {
  userId: string
  initialState: FollowerInfo
}) => {
  const { data } = useFollowerInfo({ userId, initialState })

  return (
    <span>
      Followers:{" "}
      <span className="font-semibold">{formatNumber(data?.followers)}</span>
    </span>
  )
}
