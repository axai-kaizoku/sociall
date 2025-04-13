"use client"

import { useSession } from "@/lib/providers/session-provider"
import type { PostData } from "@/lib/types"
import { atUrl, formatRelativeDate } from "@/lib/utils"
import Link from "next/link"
import { UserAvatar } from "../common/user/user-avatar"
import { PostActionButton } from "./post-action-button"

type PostProps = {
  post: PostData
}

export const Post = ({ post }: PostProps) => {
  const { user } = useSession()

  return (
    <article className="group/post space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-warp gap-3">
          {/* {JSON.stringify(post)} */}
          <Link href={atUrl(post?.user?.username)}>
            <UserAvatar avatarUrl={post.user?.avatarUrl} />
          </Link>
          <div>
            <Link
              href={atUrl(post?.user?.username)}
              className="block font-medium hover:underline"
            >
              {post.user?.displayName}
            </Link>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostActionButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  )
}
