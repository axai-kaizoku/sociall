import { UserAvatar } from "@/components/user/user-avatar"
import { UserToolTip } from "@/components/user/user-tooltip"
import { useSession } from "@/lib/providers/session-provider"
import type { CommentData } from "@/lib/types"
import { atUrl, formatRelativeDate } from "@/lib/utils"
import Link from "next/link"
import { CommentActionButton } from "./comment-action-button"

export const Comment = ({ comment }: { comment: CommentData }) => {
  const { user } = useSession()
  return (
    <div className="flex gap-3 py-3 group/comment">
      <span className="hidden sm:inline">
        <UserToolTip user={comment.user}>
          <Link href={atUrl(comment?.user?.username)}>
            <UserAvatar avatarUrl={comment?.user?.avatarUrl} size={40} />
          </Link>
        </UserToolTip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserToolTip user={comment.user}>
            <Link
              href={atUrl(comment?.user?.username)}
              className="font-medium hover:underline"
            >
              {comment?.user?.displayName}
            </Link>
          </UserToolTip>
          <span className="text-muted-foreground text-xs">
            {formatRelativeDate(comment?.createdAt)}
          </span>
        </div>
        <div>{comment?.content}</div>
      </div>
      {comment?.user?.id === user?.id && (
        <CommentActionButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  )
}
