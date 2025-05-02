"use client"

import type { UserData } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useForm } from "react-hook-form"
import {
  updateUserProfileSchema,
  type UpdateUserProfileValues,
} from "@/server/db/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUpdateProfileMutation } from "@/lib/queries/userMutations"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { LoadingButton } from "../ui/button"
import { useRef, useState } from "react"
import { Label } from "../ui/label"
import { Camera } from "lucide-react"
import { CropImageDialog } from "../crop-image.dialog"
import Resizer from "react-image-file-resizer"

export const EditProfileDialog = ({
  user,
  open,
  onOpenChange,
}: {
  user: UserData
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio ?? "",
    },
  })

  const mutation = useUpdateProfileMutation()

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null)

  const onSubmit = async (values: UpdateUserProfileValues) => {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`)
      : undefined

    mutation.mutate(
      {
        input: values,
        avatar: newAvatarFile,
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Avatar</Label>
            <AvatarInput
              src={
                croppedAvatar
                  ? URL.createObjectURL(croppedAvatar)
                  : (user?.avatarUrl ?? "/avatar-placeholder.png")
              }
              onImageCropped={setCroppedAvatar}
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <LoadingButton loading={mutation.isPending} type="submit">
                  Save
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

const AvatarInput = ({
  src,
  onImageCropped,
}: {
  src: string
  onImageCropped: (blob: Blob | null) => void
}) => {
  const [imageToCrop, setImageToCrop] = useState<File>()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onImageSelected = (image: File | undefined) => {
    if (!image) return

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file"
    )
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="hidden sr-only"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <img
          src={src}
          alt="Avatar Preview"
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover"
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black/30 text-white transition-colors duration-200 group-hover:bg-black/25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={onImageCropped}
          onClose={() => {
            setImageToCrop(undefined)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }}
        />
      )}
    </>
  )
}
