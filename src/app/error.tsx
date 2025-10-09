"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error() {
  return (
    <main className="my-12 w-full space-y-3 text-center flex h-screen items-center justify-center p-5">
      <h1 className="text-3xl font-bold">Unknown Error</h1>
      <p>Oops an unknown error occured !!</p>
      <Button asChild>
        <Link href={"/"}>Refresh</Link>
      </Button>
    </main>
  )
}
