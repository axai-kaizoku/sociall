import type { postTable, userTable } from "@/server/db/schema"
import type { InferSelectModel } from "drizzle-orm"

export const userDataSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
}

export type UserDataSelect = Pick<
  InferSelectModel<typeof userTable>,
  keyof typeof userDataSelect
>

export const postDataInclude = {
  user: {
    columns: userDataSelect,
  },
}

export type PostData = InferSelectModel<typeof postTable> & {
  user: UserDataSelect
}

export interface PostsPage {
  posts: PostData[]
  nextCursor: string | null
}
