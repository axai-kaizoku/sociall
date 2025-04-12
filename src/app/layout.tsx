import "@/styles/globals.css"

import { Providers } from "@/lib/providers"

import { type Metadata } from "next"
import { Geist } from "next/font/google"

export const metadata: Metadata = {
  title: {
    template: "%s • Sociall 00",
    default: "Sociall 00",
  },
  description: "A social media app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
