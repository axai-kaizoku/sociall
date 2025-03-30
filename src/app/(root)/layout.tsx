import SessionProvider from "@/lib/providers/session-provider"
import { validateRequest } from "@/server/auth"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { Navbar } from "./_components/navbar"

export default async function Layout({ children }: PropsWithChildren) {
  const session = await validateRequest()

  if (!session.user) redirect("/login")

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto p-5">{children}</div>
      </div>
    </SessionProvider>
  )
}
