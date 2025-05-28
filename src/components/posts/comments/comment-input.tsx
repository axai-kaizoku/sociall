import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSubmitCommentMutation } from "@/lib/queries/commentMutations"
import type { PostData } from "@/lib/types"
import { Loader2, SendHorizonal } from "lucide-react"
import { useState } from "react"

export const CommentInput = ({ post }: { post: PostData }) => {
  const [input, setInput] = useState("")

  const mutation = useSubmitCommentMutation(post.id)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input) {
      return
    }

    mutation.mutate(
      {
        content: input,
        post,
      },
      {
        onSuccess: () => setInput(""),
      }
    )
  }
  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />

      <Button
        type="submit"
        variant={"ghost"}
        size={"icon"}
        disabled={!input.trim() || mutation?.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  )
}
