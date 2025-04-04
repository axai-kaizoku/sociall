"use client"

import "./styles.editor.css"

import { UserAvatar } from "@/components/common/user/user-avatar"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/providers/session-provider"
import { submitPost } from "@/server/actions/postActions"
import { Placeholder } from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"

export const PostEditor = () => {
  const { user } = useSession()
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    immediatelyRender: false,
  })

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) ?? ""

  const onSubmit = async () => {
    await submitPost(input)
    editor?.commands.clearContent()
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user?.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </Button>
      </div>
    </div>
  )
}
