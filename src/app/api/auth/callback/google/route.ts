import { kyInstance } from "@/lib/ky"
import { streamServerClient } from "@/lib/stream"
import { slugify } from "@/lib/utils"
import { google, lucia } from "@/server/auth"
import { db } from "@/server/db"
import { userTable } from "@/server/db/schema"
import { OAuth2RequestError } from "arctic"
import { eq } from "drizzle-orm"
import { generateIdFromEntropySize } from "lucia"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")

  const storedState = (await cookies()).get("state")?.value
  const storedCodeVerifier = (await cookies()).get("code_verifier")?.value

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 })
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    )

    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })
      .json<{ id: string; name: string; email: string }>()

    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.id, googleUser.id),
    })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)

      ;(await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      )

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      })
    }

    const userId = generateIdFromEntropySize(10)

    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4)

    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({
        id: userId,
        username: username,
        displayName: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
      })

      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      })
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    })
  } catch (error) {
    console.error(error)
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 })
    }
    return new Response(null, { status: 500 })
  }
}
