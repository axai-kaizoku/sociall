import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "./_components/login-form"
import { GoogleSignInButton } from "./_components/google-signin-button"

export const metadata: Metadata = {
  title: "Login",
}

export default function Page() {
  return (
    <section className="flex h-full max-h-[40rem] w-full max-w-[64rem] rounded-2xl overflow-hidden bg-card shadow-2xl">
      <div className="md:w-1/2 w-full space-y-10 overflow-y-auto p-10">
        <h1 className="text-3xl font-bold text-center">Login to Sociall</h1>
        <div className="space-y-5">
          <GoogleSignInButton />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-muted" />
            <span>OR</span>
            <div className="h-px flex-1 bg-muted" />
          </div>
          <LoginForm />
          <Link href="/signup" className="block text-center hover:underline">
            Don&apos;t have an account? Sign Up
          </Link>
        </div>
      </div>
      <img
        src="/login-image.jpg"
        alt="Login"
        className="hidden w-1/2 object-cover md:block"
      />
    </section>
  )
}
