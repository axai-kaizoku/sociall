"use client"

import "./styles.editor.css"

import { Button, LoadingButton } from "@/components/ui/button"
import { UserAvatar } from "@/components/user/user-avatar"
import { useMediaUpload, type Attachment } from "@/hooks/use-media-upload"
import { useSession } from "@/lib/providers/session-provider"
import { useSubmitPostMutation } from "@/lib/queries/postMutations"
import { cn } from "@/lib/utils"
import { Placeholder } from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { useDropzone } from "@uploadthing/react"
import { ImageIcon, Loader2, X } from "lucide-react"
import { useRef, type ClipboardEvent } from "react"

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop: startUpload,
  })

  const onPaste = async (e: ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[]

    await startUpload(files)
  }

  const { onClick, ...rootProps } = getRootProps()

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
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3",
              isDragActive && "outline-dashed"
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="animate-spin size-5 text-primary" />
          </>
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments?.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
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

const AddAttachmentsButton = ({
  disabled,
  onFilesSelected,
}: {
  onFilesSelected: (files: File[]) => void
  disabled: boolean
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        name="attachments"
        id="attachments"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="hidden sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files?.length) {
            onFilesSelected(files)
            e.target.value = ""
          }
        }}
      />
    </>
  )
}

const AttachmentPreviews = ({
  attachments,
  removeAttachment,
}: {
  attachments: Attachment[]
  removeAttachment: (filename: string) => void
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments?.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments?.map((attachment) => (
        <AttachmentPreview
          key={attachment?.mediaId}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment?.file?.name)}
        />
      ))}
    </div>
  )
}

const AttachmentPreview = ({
  attachment: { file, isUploading },
  onRemoveClick,
}: {
  attachment: Attachment
  onRemoveClick: () => void
}) => {
  const src = URL.createObjectURL(file)

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <img
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}

      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
