import { TrendsSidebar } from "@/components/common/trends-sidebar"
import type { Metadata } from "next"
import { Notifications } from "./_components/notifications"

export const metadata: Metadata = {
  title: "Notifications",
}

export default function HomePage() {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Notifications</h1>
        </div>
        <Notifications />
      </div>
      <TrendsSidebar />
    </main>
  )
}
