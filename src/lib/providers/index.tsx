"use client"

import { useState, type PropsWithChildren } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export const Providers = ({ children }: PropsWithChildren) => {
  const [client] = useState(new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
      </NextThemesProvider>
    </QueryClientProvider>
  )
}
