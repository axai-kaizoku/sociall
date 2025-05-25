import { TrendsSidebar } from "@/components/common/trends-sidebar"
import { Saved } from "./_components/saved"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saved Posts",
}

export default function HomePage() {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Saved Posts</h1>
        </div>
        <Saved />
      </div>
      <TrendsSidebar />
    </main>
  )
}
