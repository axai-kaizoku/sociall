import { validateRequest } from "@/server/auth"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"

export default async function Layout({ children }: PropsWithChildren) {
  const { user } = await validateRequest()

  if (user) redirect("/")

  return (
    <main className="flex h-screen items-center justify-center p-5">
      {children}
    </main>
  )
}
