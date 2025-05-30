"use client"

import { useSession } from "@/lib/providers/session-provider"
import type { FollowerInfo, UserData } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import Link from "next/link"
import { atUrl } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"
import { FollowButton } from "../follow-button"
import { Linkify } from "../linkify"
import { FollowerCount } from "./follower-count"

export const UserToolTip = ({
  children,
  user,
}: {
  children: React.ReactNode
  user: UserData
}) => {
  const { user: loggedInUser } = useSession()

  const followerState: FollowerInfo = {
    followers: user?.followers?.length,
    isFollowedByUser: !!user?.followers?.some(
      ({ followerId }) => followerId === loggedInUser.id
    ),
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            <div className="flex items-center justify-between gap-2">
              <Link href={atUrl(user.username)}>
                <UserAvatar size={70} avatarUrl={user?.avatarUrl} />
              </Link>
              {loggedInUser.id !== user?.id && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>
            <div>
              <Link href={atUrl(user.username)}>
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName}
                </div>
                <div className="text-muted-foreground">{`@${user.username}`}</div>
              </Link>
            </div>
            {user?.bio && (
              <Linkify>
                <div className="line-clamp-2 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}
            <FollowerCount userId={user.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
