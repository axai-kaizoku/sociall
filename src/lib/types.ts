import type { Like, Media, postTable } from "@/server/db/schema"
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
      // you can get likes info here
    },
  }
}

// export const postDataInclude = {
//   user: {
//     columns: userDataSelect,
//   },
// }

export type UserData = {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio?: string | null
  createdAt?: Date
  followers: {
    followerId: string | null
  }[]
  postCount?: number | undefined
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
  media: Media[]
  likes: Like[]
}

export interface PostsPage {
  posts: PostData[]
  nextCursor: string | null
}

export interface FollowerInfo {
  followers: number
  isFollowedByUser: boolean
}

export interface LikeInfo {
  likes: number
  isLikedByUser: boolean
}
