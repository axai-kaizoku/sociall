import { validateRequest } from "@/server/auth"
import { db } from "@/server/db"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { UserAvatar } from "./user/user-avatar"
import { Button } from "../ui/button"
import { unstable_cache } from "next/cache"
import { postTable } from "@/server/db/schema"
import { sql } from "drizzle-orm"
import { formatNumber } from "@/lib/utils"

export const TrendsSidebar = () => {
  return (
    <div className="sticky top-[5.25rem] hidden md:block lg:w-80 w-72 h-fit flex-none space-y-5">
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
      </Suspense>

      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <TrendingTopics />
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

const getTrendingTopics = unstable_cache(
  async (): Promise<{ hashtag: string; count: number }[]> => {
    // const result = await db
    //   .select({
    //     data: sql<{ hashtag: string; count: bigint }[]>`
    //   SELECT unnest(regexp_matches(content, '#[a-zA-Z0-9_]+', 'g')) AS hashtag, COUNT(*) AS count
    //   FROM ${postTable}
    //   GROUP BY (hashtag)
    //   ORDER BY count DESC, hashtag ASC
    //   LIMIT 5
    // `,
    //   })
    //   .from(postTable)

    // const result = await db
    //   .select({
    //     postContent: postTable.content,
    //     hashtag: sql`${postTable.content} REGEXP '^/#/+`,
    //     // sql`${files.path} REGEXP '^/tmp/foo(5)/tutu`
    //     // createdAt: postTable.createdAt,
    //     count: sql<number>`count(${postTable.content})`.mapWith(Number),
    //   })
    //   .from(postTable)
    //   .groupBy(sql`${postTable.content}`)

    const result = await db.execute(
      sql<{ hashtag: string; count: bigint }[]>`
          SELECT unnest(regexp_matches(content, '#[a-zA-Z0-9_]+', 'g')) AS hashtag, count(*) AS count
          FROM ${postTable}
          GROUP BY (hashtag)
          ORDER BY count DESC, hashtag ASC
          LIMIT 5
        `
    )

    // console.log(res1)
    // .orderBy(sql`${postTable.createdAt} desc nulls first`)
    // [
    //   { hashtag: '#chill', count: '2' },
    //   { hashtag: '#react', count: '2' },
    //   { hashtag: '#axai', count: '1' },
    //   { hashtag: '#nextjs', count: '1' },
    //   { hashtag: '#typescript', count: '1' }
    // ]

    return result?.map((row) => ({
      hashtag: row.hashtag as string,
      count: Number(row.count),
    }))
    // console.log(result)
  },
  ["trending_topics"],
  { revalidate: 3 * 60 * 60 }
)

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics()
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending Topics</div>
      {trendingTopics?.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1]

        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 break-all font-semibold hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
