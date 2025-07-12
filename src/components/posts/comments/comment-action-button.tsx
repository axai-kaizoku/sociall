import type { CommentData } from "@/lib/types"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { DeleteCommentDialog } from "./delete-comment.dialog"

export const CommentActionButton = ({
  comment,
  className,
}: {
  comment: CommentData
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-0 w-fit">
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="min-w-0 w-fit"
          >
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCommentDialog
        comment={comment}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
