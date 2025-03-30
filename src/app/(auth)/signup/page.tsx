import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "./_components/signup-form"
export const metadata: Metadata = {
  title: "Sign Up",
}

export default function Page() {
  return (
    <section className="flex h-full max-h-[40rem] w-full max-w-[64rem] rounded-2xl overflow-hidden bg-card shadow-2xl">
      <div className="md:w-1/2 w-full space-y-10 overflow-y-auto p-10">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold">Sign up to Sociall</h1>
          <p className="text-muted-foreground">
            Social Media platform like reddit, where{" "}
            <span className="italic">you</span> can find your stuff
          </p>
        </div>
        <div className="space-y-5">
          <SignUpForm />
          <Link href="/login" className="block text-center hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>
      <img
        src="/signup-image.jpg"
        alt="signup"
        className="w-1/2 hidden md:block object-cover"
      />
    </section>
  )
}
