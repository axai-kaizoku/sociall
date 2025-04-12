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

export type UserData = {
  postCount: number | undefined
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  createdAt: Date
  followers: {
    followerId: string | null
  }[]
}

export type PostData = InferSelectModel<typeof postTable> & {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: null
    followers: {
      followerId: string
    }[]
  }
}

export interface PostsPage {
  posts: PostData[]
  nextCursor: string | null
}

export interface FollowerInfo {
  followers: number
  isFollowedByUser: boolean
}
