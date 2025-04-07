import type { postTable } from "@/server/db/schema"
import type { InferSelectModel } from "drizzle-orm"

export function getUserDataSelect() {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    followers: {
      followerId: true,
      followers: true,
      isFollowedByUser: true,
    },
  }
}

// export const userDataSelect = {
//   id: true,
//   username: true,
//   displayName: true,
//   avatarUrl: true,
// }

// export type UserDataSelect = Pick<
//   InferSelectModel<typeof userTable>,
//   keyof typeof userDataSelect
// >

export function getPostDataInclude() {
  return {
    user: {
      select: getUserDataSelect(),
    },
  }
}

// export const postDataInclude = {
//   user: {
//     columns: userDataSelect,
//   },
// }

export type PostData = InferSelectModel<typeof postTable> & {
  user: ReturnType<typeof getPostDataInclude>
}

export interface PostsPage {
  posts: PostData[]
  nextCursor: string | null
}

export interface FollowerInfo {
  followers: number
  isFollowedByUser: boolean
}
