import { Lucia, type Session, type User } from "lucia"
import { cookies } from "next/headers"
import { cache } from "react"
import { adapter } from "./db/schema"
import { Google } from "arctic"
import { env } from "@/env"

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
    }
  },
})

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseUserAttributes {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  googleId: string | null
}

export const google = new Google(
  String(env.GOOGLE_CLIENT_ID ?? ""),
  String(env.GOOGLE_CLIENT_SECRET ?? ""),
  `${String(env.NEXT_PUBLIC_BASE_URL ?? "")}/api/auth/callback/google`
)

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const nextCookies = await cookies()
    const sessionId = nextCookies.get(lucia.sessionCookieName)?.value ?? null

    if (!sessionId) {
      return { session: null, user: null }
    }

    const result = await lucia.validateSession(sessionId)

    try {
      if (result?.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)
        nextCookies.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        )
      }

      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie()
        nextCookies.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        )
      }
    } catch {}

    return result
  }
)
