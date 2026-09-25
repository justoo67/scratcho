"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeftIcon, TrophyIcon, HomeIcon, FlameIcon } from "lucide-react"
import { UserAccountBadge } from "@/components/auth/user-account-badge"
import { cn } from "@/lib/utils"

export function CourtNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  // The live scoreboard is optimized for zero-scroll courtside operation
  if (pathname.includes("/score")) {
    return null
  }

  function handleBack() {
    // If on a run detail page or game result, back should return cleanly
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        {/* Left: Back button + Home Brand */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center gap-1 -ml-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 active:bg-muted transition-colors"
          >
            <ArrowLeftIcon className="size-4 shrink-0" />
            <span>Back</span>
          </button>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold tracking-tight text-foreground text-sm hover:opacity-85 transition-opacity"
            title="Go to Scratcho Home"
          >
            <span className="bg-primary text-primary-foreground text-[10px] font-black size-5 rounded-md flex items-center justify-center">
              S
            </span>
            <span>Scratcho</span>
          </Link>
        </div>

        {/* Right: Quick Links & Account */}
        <div className="flex items-center gap-2">
          <Link
            href="/runs"
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-md transition-colors flex items-center gap-1",
              pathname === "/runs"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <FlameIcon className="size-3 text-primary" />
            <span>Runs</span>
          </Link>

          <UserAccountBadge />
        </div>
      </div>
    </header>
  )
}
