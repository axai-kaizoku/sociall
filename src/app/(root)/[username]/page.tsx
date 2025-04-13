import { TrendsSidebar } from "@/components/common/trends-sidebar"
import { FollowButton } from "@/components/follow-button"
import { Linkify } from "@/components/linkify"
import { Button } from "@/components/ui/button"
import { FollowerCount } from "@/components/user/follower-count"
import { UserAvatar } from "@/components/user/user-avatar"
import type { FollowerInfo, UserData } from "@/lib/types"
import { extractUsername, formatNumber } from "@/lib/utils"
import { getUser } from "@/server/actions/userActions"
import { validateRequest } from "@/server/auth"
import { formatDate } from "date-fns"
import type { Metadata } from "next"
import { UserPosts } from "./_components/user-posts"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const urlParams = await params
  const cleanUserName = extractUsername(urlParams.username)

  const { user: loggedInUser } = await validateRequest()
  if (!loggedInUser) return {}

  const user = await getUser(cleanUserName, loggedInUser.id)

  return {
    title: `${user.displayName} (@${user.username})`,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const urlParams = await params
  const cleanUserName = extractUsername(urlParams.username)

  const { user: loggedInUser } = await validateRequest()

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    )
  }

  const user = await getUser(cleanUserName, loggedInUser.id)

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile loggedInUserId={loggedInUser.id} user={user} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user?.displayName}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user?.id} />
      </div>
      <TrendsSidebar />
    </main>
  )
}

async function UserProfile({
  user,
  loggedInUserId,
}: {
  user: UserData
  loggedInUserId: string
}) {
  const followerInfo: FollowerInfo = {
    followers: user.followers.length,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId
    ),
  }
  return (
    <section className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user?.displayName}</h1>
            <div className="text-muted-foreground">{`@${user?.username}`}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user?.postCount ?? 0)}
              </span>
            </span>
            <FollowerCount userId={user?.id} initialState={followerInfo} />
          </div>
        </div>
        {user?.id === loggedInUserId ? (
          <Button>Edit profile</Button>
        ) : (
          <FollowButton userId={user?.id} initialState={followerInfo} />
        )}
      </div>
      {user?.bio && (
        <>
          <hr />
          <Linkify>
            <div className="whitespace-pre-line overflow-hidden break-words">
              {user?.bio}
            </div>
          </Linkify>
        </>
      )}
    </section>
  )
}
