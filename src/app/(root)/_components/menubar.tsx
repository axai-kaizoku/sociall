import { Button } from "@/components/ui/button"
import { Bell, Bookmark, HomeIcon, Mail } from "lucide-react"
import Link from "next/link"

export const MenuBar = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <HomeIcon />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Notifications"
        asChild
      >
        <Link href="/notifications">
          <Bell />
          <span className="hidden lg:inline">Notifications</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Messages"
        asChild
      >
        <Link href="/messages">
          <Mail />
          <span className="hidden lg:inline">Messages</span>
        </Link>
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-start gap-3"
        title="Saved"
        asChild
      >
        <Link href="/saved">
          <Bookmark />
          <span className="hidden lg:inline">Saved</span>
        </Link>
      </Button>
    </div>
  )
}
