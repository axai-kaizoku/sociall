import type { PropsWithChildren } from "react"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      {children}
    </main>
  )
}
