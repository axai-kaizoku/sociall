import { cn } from "@/lib/utils"
import type React from "react"
import type { PropsWithChildren } from "react"
import { useInView } from "react-intersection-observer"

export const InfiniteScrollContainer = ({
  onBottomReached,
  children,
  className,
}: PropsWithChildren & {
  onBottomReached: () => void
  className?: string
}) => {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached()
      }
    },
  })
  return (
    <div className={cn(className)}>
      {children}
      <div ref={ref} />
    </div>
  )
}
