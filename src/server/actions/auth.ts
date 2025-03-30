"use server"

import { generateIdFromEntropySize } from "lucia"
import {
  loginSchema,
  signUpSchema,
  type LoginValues,
  type SignUpValues,
} from "../db/validation"
import { hash, verify } from "@node-rs/argon2"
import { db } from "../db"
import { userTable } from "../db/schema"
import { eq, ilike } from "drizzle-orm"
import { lucia, validateRequest } from "../auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export async function signUp(
  credentials: SignUpValues
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials)

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    const userId = generateIdFromEntropySize(10)

    const [existingUsername] = await db
      .select()
      .from(userTable)
      .where(ilike(userTable.username, username))

    if (existingUsername) {
      return {
        error: "Username already taken",
      }
    }

    const [existingEmail] = await db
      .select()
      .from(userTable)
      .where(ilike(userTable.email, email))

    if (existingEmail) {
      return {
        error: "Email already exists",
      }
    }

    await db.insert(userTable).values({
      id: userId,
      username: username,
      displayName: username,
      email: email,
      passwordHash: passwordHash,
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return redirect("/")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error(error)
    return {
      error: "Something went wrong, please try again.",
    }
  }
}

export async function login(
  credentials: LoginValues
): Promise<{ error: string }> {
  try {
    const { password, username } = loginSchema.parse(credentials)

    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(ilike(userTable.username, username))

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password",
      }
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      }
    }

    const session = await lucia.createSession(existingUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    ;(await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )

    return redirect("/")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error(error)
    return {
      error: "Something went wrong, please try again.",
    }
  }
}

export async function logout() {
  const { session } = await validateRequest()

  if (!session) {
    throw new Error("Unauthorized")
  }

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()

  ;(await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )

  return redirect("/login")
}
