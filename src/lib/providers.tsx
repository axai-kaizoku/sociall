"use client"

import type { PropsWithChildren } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
