"use client"

import "./styles.editor.css"

import { LoadingButton } from "@/components/ui/button"
import { UserAvatar } from "@/components/user/user-avatar"
import { useMediaUpload } from "@/hooks/use-media-upload"
import { useSession } from "@/lib/providers/session-provider"
import { useSubmitPostMutation } from "@/lib/queries/postMutations"
import { Placeholder } from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"

export const PostEditor = () => {
  const { user } = useSession()

  const mutation = useSubmitPostMutation()

  const {
    startUpload,
    attachments,
    isUploading,
    removeAttachment,
    reset: resetMediaUploads,
    uploadProgress,
  } = useMediaUpload()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    // editorProps: {
    //   handleKeyDown(view, event) {
    //     if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    //       event.preventDefault()
    //       void onSubmit()
    //       return true
    //     }
    //     return false
    //   },
    // },
    immediatelyRender: false,
  })

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) ?? ""

  const onSubmit = async () => {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent()
          resetMediaUploads()
        },
      }
    )
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
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
          {/* {!mutation.isPending && (
            <kbd className="-me-1 ms-0 hidden lg:inline-flex h-5 max-h-full items-center rounded border border-neutral-700 dark:border-neutral-300 bg-primary px-1 font-[inherit] text-[1rem] font-medium text-muted-foreground/95">
              ⌘<span className="-mt-0.5">↵</span>
            </kbd>
          )} */}
        </LoadingButton>
      </div>
    </div>
  )
}
