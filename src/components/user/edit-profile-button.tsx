"use client"

import type { UserData } from "@/lib/types"
import { useState } from "react"
import { Button } from "../ui/button"
import { EditProfileDialog } from "./edit-profile.dialog"

export const EditProfileButton = ({ user }: { user: UserData }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit Profile
      </Button>
      <EditProfileDialog open={open} onOpenChange={setOpen} user={user} />
    </>
  )
}
