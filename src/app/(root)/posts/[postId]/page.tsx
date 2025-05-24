import { FollowButton } from "@/components/follow-button"
import { Linkify } from "@/components/linkify"
import { Post } from "@/components/posts/post"
import { UserAvatar } from "@/components/user/user-avatar"
import { UserToolTip } from "@/components/user/user-tooltip"
import type { UserData } from "@/lib/types"
import { atUrl } from "@/lib/utils"
import { getPost } from "@/server/actions/postActions"
import { validateRequest } from "@/server/auth"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

type Props = {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await validateRequest()

  if (!user) return {}
  const postId = (await params).postId

  const post = await getPost({ postId, loggedInUserId: user?.id })

  return {
    title: `${post?.user?.displayName}: ${post?.content?.slice(0, 50)}...`,
  }
}

export default async function Page({ params }: Props) {
  const { user } = await validateRequest()

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    )
  }

  const postId = (await params).postId

  const post = await getPost({ postId, loggedInUserId: user?.id })

  return (
    <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
      <main className="flex w-full min-w-0 gap-5">
        <div className="w-full min-w-0 space-y-5">
          <Post post={post} />
        </div>
        <div className="sticky top-[5.25rem] hidden md:block lg:w-80 w-72 h-fit flex-none">
          <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
            <UserInfoSidebar user={post?.user} />
          </Suspense>
        </div>{" "}
      </main>
    </Suspense>
  )
}

const UserInfoSidebar = async ({ user }: { user: UserData }) => {
  const { user: loggedInUser } = await validateRequest()

  if (!loggedInUser) return null

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserToolTip user={user}>
        <Link href={atUrl(user.username)} className="flex items-center gap-3">
          <UserAvatar avatarUrl={user?.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {user?.displayName}
            </p>
            <p className="line-clamp-1 text-muted-foreground break-all">
              {`@${user?.username}`}
            </p>
          </div>
        </Link>
      </UserToolTip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {user?.bio}
        </div>
      </Linkify>
      {user?.id !== loggedInUser?.id && (
        <FollowButton
          userId={user?.id}
          initialState={{
            followers: user?.followers?.length,
            isFollowedByUser: user?.followers?.some?.(
              ({ followerId }) => followerId === loggedInUser?.id
            ),
          }}
        />
      )}
    </div>
  )
}
