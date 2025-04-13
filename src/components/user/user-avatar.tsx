import { cn } from "@/lib/utils"

export const UserAvatar = ({
  avatarUrl,
  size,
  className,
}: {
  avatarUrl: string | null | undefined
  size?: number
  className?: string
}) => {
  return (
    <img
      src={avatarUrl ?? "/avatar-placeholder.png"}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
    />
  )
}
