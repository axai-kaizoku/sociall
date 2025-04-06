import type { PostData } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { DeletePostDialog } from "./delete-post.dialog"
import { useState } from "react"

export const PostActionButton = ({
  post,
  className,
}: {
  post: PostData
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
      <DeletePostDialog
        post={post}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
