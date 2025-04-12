import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDate, formatDistanceToNowStrict } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date()

  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true })
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d")
    } else {
      return formatDate(from, "MMM d, yyyy")
    }
  }
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

export function atUrl(username: string) {
  return `/@${encodeURIComponent(username)}` // encodes '@' as %40
}

export function extractUsername(rawUsername: string) {
  return rawUsername.startsWith("@")
    ? rawUsername.slice(1)
    : rawUsername.replace(/^%40/, "")
}
