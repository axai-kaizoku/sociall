import { TrendsSidebar } from "@/components/common/trends-sidebar"
import type { Metadata } from "next"
import { SearchResults } from "./_components/search-results"

type PageProps = {
  searchParams: { q: string }
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const q = searchParams.q
  return {
    title: `Search results for "${q}"`,
  }
}

export default function Page({ searchParams }: PageProps) {
  const q = searchParams.q

  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold line-clamp-2 break-all">
            Search results for &quot;{q}&quot;
          </h1>
        </div>
        <SearchResults q={q} />
      </div>
      <TrendsSidebar />
    </main>
  )
}
