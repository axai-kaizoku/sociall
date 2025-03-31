import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env"
import * as schema from "./schema"
// import { Pool } from "pg"

// To check if it's prod
// const isProduction = env.NODE_ENV === "production"

// Create connection options. For production, you might need to configure
// ssl to not reject unauthorized certificates.
// const connectionOptions = {
//   ssl: isProduction ? { rejectUnauthorized: false } : false,
// }

// Create a single instance for production or development
// let dbInstance: ReturnType<typeof drizzle>

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL)
if (env.NODE_ENV !== "production") globalForDb.conn = conn

export const db = drizzle(conn, { schema })

// if (isProduction) {
//   // For production, use a pool with proper SSL settings
//   const pool = new Pool({
//     connectionString: env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false },
//   },schema)
//   dbInstance = drizzle(pool)
// } else {
//   // For development, you can still use caching to avoid multiple connections
//   const globalForDb = globalThis as unknown as {
//     conn: postgres.Sql | undefined
//   }
//   const conn =
//     globalForDb.conn ??
//     postgres({ ...connectionOptions, ...{ host: env.DATABASE_URL } })
//   globalForDb.conn ??= conn
//   // if (!globalForDb.conn) globalForDb.conn = conn
//   dbInstance = drizzle(conn, { schema })
// }

// export { dbInstance as db }
