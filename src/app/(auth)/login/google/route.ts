import { env } from "@/env"
import { google } from "@/server/auth"
import { generateCodeVerifier, generateState } from "arctic"
import { cookies } from "next/headers"

export async function GET() {
  const state = generateState()

  const codeVerifier = generateCodeVerifier()

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "profile",
    "email",
  ])

  ;(await cookies()).set("state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })
  ;(await cookies()).set("code_verifier", codeVerifier, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  })

  return Response.redirect(url)
}
