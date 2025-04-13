// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm"
import {
  index,
  pgTableCreator,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { drizzle } from "drizzle-orm/node-postgres"
import { text, timestamp } from "drizzle-orm/pg-core"
import { Pool } from "pg"
import { env } from "@/env"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `sociall_${name}`)

// ----

const pool = new Pool({ ssl: true, connectionString: env.DATABASE_URL })
const db = drizzle(pool)

const userTable = createTable(
  "user",
  {
    id: varchar("id", { length: 256 }).primaryKey(),
    username: varchar("username", { length: 256 }).unique().notNull(),
    displayName: varchar("display_name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).unique(),
    passwordHash: varchar("password_hash", { length: 2048 }),
    googleId: varchar("google_id", { length: 1024 }).unique(),
    avatarUrl: varchar("avatar_url", { length: 1024 }),
    bio: varchar("bio", { length: 1024 }),

    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => {
    return [index("user_index").on(t.id)]
  }
)

export type User = typeof userTable.$inferSelect

const sessionTable = createTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})

const followTable = createTable(
  "follows",
  {
    followerId: text("follower_id"),
    follower: text("follower_user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    followingId: text("following_id"),
    following: text("following_user_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
  },
  (t) => [unique().on(t.followerId, t.followingId)]
)

const postTable = createTable("post", {
  id: uuid().defaultRandom().primaryKey(),
  content: varchar("content", { length: 4096 }),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  createdAt: timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type Post = typeof postTable.$inferSelect

export const postRelations = relations(postTable, ({ one }) => ({
  user: one(userTable, {
    fields: [postTable.userId],
    references: [userTable.id],
  }),
}))

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postTable),
  followers: many(followTable, {
    relationName: "followingUser",
  }),
  following: many(followTable, {
    relationName: "followerUser",
  }),
}))

export const followRelations = relations(followTable, ({ one }) => ({
  followerUser: one(userTable, {
    fields: [followTable.follower],
    references: [userTable.id],
    relationName: "followerUser",
  }),
  followingUser: one(userTable, {
    fields: [followTable.following],
    references: [userTable.id],
    relationName: "followingUser",
  }),
}))

export { postTable, sessionTable, userTable, followTable }

export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable)
