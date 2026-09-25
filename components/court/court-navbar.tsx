"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
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
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-md items-center justify-between px-3">
        {/*
          Back Button Placement & UX Rationale:
          1. Placement: Placed at the far-left to align with standard mobile UX conventions
             (iOS navigation bars & Android TopAppBars) where users intuitively look for backward navigation.
          2. Compact Icon Target: Replaced the previous text badge + divider with an icon-only
             button (size-8 touch target) to prevent horizontal crowding next to the logo and account badge
             on narrow screens (~360px mobile viewports).
          3. Proximity to Logo: Placing the back button directly next to the 'Scratcho' home link creates
             minor navigational redundancy since both lead backward/home on shallow stacks. For deeper pages
             (e.g., /runs/[id] or /games/new), it acts as a true step-back, while the logo remains the global home anchor.
          4. Courtside Ergonomics: The top-left corner is outside the primary one-handed thumb zone,
             which reduces accidental triggers during rapid stat-keeping sessions.
        */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground active:scale-95"
          >
            <ArrowLeftIcon className="size-4 shrink-0" />
            <span className="sr-only">Go back</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-foreground transition-opacity hover:opacity-85"
            title="Go to Scratcho Home"
          >
            <span className="flex size-5 items-center justify-center rounded-md bg-primary text-[10px] font-black text-primary-foreground shadow-xs">
              S
            </span>
            <span className="tracking-tight">Scratcho</span>
          </Link>
        </div>

        {/* Right: Navigation Link & User Account Badge */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/runs"
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
              pathname === "/runs"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Runs
          </Link>

          <UserAccountBadge />
        </div>
      </div>
    </header>
  )
}

