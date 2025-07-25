import { streamServerClient } from "@/lib/stream"
import { validateRequest } from "@/server/auth"

export async function GET() {
  try {
    const { user } = await validateRequest()

    console.log("Calling get token for user:", user?.id)

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60

    const issuedAt = Math.floor(Date.now() / 1000) - 60

    const token = streamServerClient.createToken(
      user?.id,
      expirationTime,
      issuedAt
    )

    return Response.json({ token })
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
