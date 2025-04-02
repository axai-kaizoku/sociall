import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { UserAvatar } from "./user/user-avatar"
import { Button } from "../ui/button"

export const TrendsSidebar = () => {
  return (
    <div className="sticky top-[5.25rem] hidden md:block lg:w-80 w-72 h-fit flex-none space-y-5">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
      </Suspense>
    </div>
  )
}

async function WhoToFollow() {
  const { user } = await validateRequest()

  if (!user) {
    return null
  }

  const usersToFollow = await db.query.userTable.findMany({
    where(fields, operators) {
      return operators.not(operators.eq(fields.id, user.id))
    },
    columns: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
    limit: 5,
  })

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div className="flex items-center justify-baseline gap-3" key={user.id}>
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground">
                {user.username}
              </p>
            </div>
          </Link>

          <Button>Follow</Button>
        </div>
      ))}
    </div>
  )
}
