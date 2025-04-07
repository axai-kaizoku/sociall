import { kyInstance } from "@/lib/ky"
import type { FollowerInfo } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export function useFollowerInfo({
  userId,
  initialState,
}: {
  userId: string
  initialState: FollowerInfo
}) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  })

  return query
}
