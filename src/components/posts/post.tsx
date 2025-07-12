"use client"

import { useSession } from "@/lib/providers/session-provider"
import type { PostData } from "@/lib/types"
import { atUrl, cn, formatRelativeDate } from "@/lib/utils"
import type { Media } from "@/server/db/schema"
import Link from "next/link"
import { LikeButton } from "../like-button"
import { Linkify } from "../linkify"
import { UserAvatar } from "../user/user-avatar"
import { UserToolTip } from "../user/user-tooltip"
import { PostActionButton } from "./post-action-button"
import { SaveButton } from "../save-button"
import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Comments } from "./comments/comments"

type PostProps = {
  post: PostData
}

export const Post = ({ post }: PostProps) => {
  const { user } = useSession()

  const [showComments, setShowComments] = useState(false)

  return (
    <article className="group/post space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-warp gap-3">
          {/* {JSON.stringify(post)} */}
          <UserToolTip user={post?.user}>
            <Link href={atUrl(post?.user?.username)}>
              <UserAvatar avatarUrl={post.user?.avatarUrl} />
            </Link>
          </UserToolTip>

          <div>
            <UserToolTip user={post?.user}>
              <Link
                href={atUrl(post?.user?.username)}
                className="block font-medium hover:underline"
              >
                {post?.user?.displayName}
              </Link>
            </UserToolTip>

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
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.media?.length && <MediaPreviews attachments={post?.media} />}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post?.id}
            initialState={{
              likes: post?.likes?.length,
              isLikedByUser: post?.likes?.some(
                (like) => like.userId === user?.id
              ),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments((prev) => !prev)}
          />
        </div>
        <SaveButton
          postId={post?.id}
          initialState={{
            isSavedByUser: post?.saved?.some(
              (saved) => saved.userId === user?.id
            ),
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
    </article>
  )
}

const MediaPreviews = ({ attachments }: { attachments: Media[] }) => (
  <div
    className={cn(
      "flex flex-col gap-3",
      attachments?.length > 1 && "sm:grid sm:grid-cols-2"
    )}
  >
    {attachments.map((m, i) => (
      <MediaPreview key={`${m.id}-${i}`} media={m} />
    ))}
  </div>
)

const MediaPreview = ({ media }: { media: Media }) => {
  if (media.type === "IMAGE") {
    return (
      <img
        src={media?.url ?? ""}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    )
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media?.url ?? ""}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    )
  }

  return <p className="text-destructive">Unsupported media type</p>
}

const CommentButton = ({
  post,
  onClick,
}: {
  post: PostData
  onClick: () => void
}) => {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post?.comments?.length}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  )
}
