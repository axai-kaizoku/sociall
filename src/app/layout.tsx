import "@/styles/globals.css"

import { Providers } from "@/lib/providers"

import { type Metadata } from "next"
import { Geist } from "next/font/google"

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"

import { fileRouter } from "@/app/api/uploadthing/core"

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
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(fileRouter)}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
