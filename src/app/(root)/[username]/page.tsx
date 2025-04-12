import { TrendsSidebar } from "@/components/common/trends-sidebar"
import { extractUsername } from "@/lib/utils"
import { getUser } from "@/server/actions/userActions"
import { validateRequest } from "@/server/auth"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const urlParams = await params
  const cleanUserName = extractUsername(urlParams.username)

  const { user: loggedInUser } = await validateRequest()
  if (!loggedInUser) return {}

  const user = await getUser(cleanUserName, loggedInUser.id)

  return {
    title: `${user.displayName} (@${user.username})`,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const urlParams = await params
  const cleanUserName = extractUsername(urlParams.username)

  const { user: loggedInUser } = await validateRequest()

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    )
  }

  const user = await getUser(cleanUserName, loggedInUser.id)

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">{JSON.stringify(user)}</div>
      <TrendsSidebar />
    </main>
  )
}

async function UserProfile({}) {
  return <div></div>
}
