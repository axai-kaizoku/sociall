"use client"

import type { UserData } from "@/lib/types"
import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent } from "../ui/dialog"

export const EditProfileButton = ({ user }: { user: UserData }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit Profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>dialog</DialogContent>
      </Dialog>
    </>
  )
}
