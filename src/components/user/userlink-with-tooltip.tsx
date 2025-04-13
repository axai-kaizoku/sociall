"use client"

import { kyInstance } from "@/lib/ky"
import type { UserData } from "@/lib/types"
import { atUrl } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { HTTPError } from "ky"
import Link from "next/link"
import { UserToolTip } from "./user-tooltip"

export const UserLinkWithTooltip = ({
  username,
  children,
}: {
  username: string
  children: React.ReactNode
}) => {
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(),
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false
      }

      return failureCount < 3
    },
    staleTime: Infinity,
  })

  if (!data) {
    return (
      <Link href={atUrl(username)} className="text-primary hover:underline">
        {children}
      </Link>
    )
  }
  return (
    <UserToolTip user={data}>
      <Link href={atUrl(username)} className="text-primary hover:underline">
        {children}
      </Link>
    </UserToolTip>
  )
}
