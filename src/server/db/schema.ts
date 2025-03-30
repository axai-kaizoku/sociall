// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm"
import { index, pgTableCreator, varchar } from "drizzle-orm/pg-core"

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { text, timestamp } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `sociall_${name}`)

// ----

const pool = new pg.Pool({ ssl: true })
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

export { userTable, sessionTable }

export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable)
