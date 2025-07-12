import { useDeleteCommentMutation } from "@/lib/queries/commentMutations"
import { Button, LoadingButton } from "../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"

import type { CommentData } from "@/lib/types"

export const DeleteCommentDialog = ({
  comment,
  open,
  onClose,
}: {
  comment: CommentData
  open: boolean
  onClose: () => void
}) => {
  const mutation = useDeleteCommentMutation()

  const handleOpenChange = (open: boolean) => {
    if (!open || !mutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete post?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-1 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={() =>
              mutation.mutate({ id: comment?.id }, { onSuccess: onClose })
            }
            loading={mutation.isPending}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
