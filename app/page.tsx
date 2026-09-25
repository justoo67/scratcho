import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { UserAccountBadge } from "@/components/auth/user-account-badge"

import { getRecentRuns } from "@/lib/runs/actions"
import { RecentRunsList } from "@/components/runs/recent-runs-list"
import { toPlain } from "@/lib/utils"

export default async function Home() {
  const recentRuns = await getRecentRuns(4).catch(() => [])

  return (
    <div className="relative mx-auto flex min-h-svh max-w-md flex-col overflow-y-auto overflow-x-hidden">
      {/* Full-bleed background — grayscale via CSS filter */}
      <Image
        src="/basketball_court.webp"
        alt="Basketball court"
        fill
        priority
        className="object-cover grayscale"
        sizes="(max-width: 448px) 100vw, 448px"
      />

      {/* Dark gradient scrim — bottom-heavy so text is legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />

      {/* Top Header: Nav + Fast Auth */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-8">
        <Link
          href="/runs"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
        >
          <span>Browse Past Runs</span>
        </Link>
        <UserAccountBadge />
      </div>

      {/* Content pinned to bottom */}
      <div className="relative mt-auto flex flex-col gap-5 px-6 pb-12 pt-16 z-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Scratcho
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Pickup basketball stats, courtside.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/runs/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full bg-white text-black text-sm hover:bg-white/90 font-semibold"
            )}
          >
            Start a New Run
          </Link>
          <Link
            href="/games/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 w-full border-white/30 text-white text-sm hover:bg-white/10 hover:text-white font-medium"
            )}
          >
            Quick Game (no run)
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/runs"
            className="text-xs text-white/70 hover:text-white underline underline-offset-4 transition-colors py-1"
          >
            View all recurring runs &amp; past games →
          </Link>
        </div>

        <RecentRunsList initialRuns={toPlain(recentRuns)} />

        <p className="text-center text-[11px] text-white/40">
          No sign-up needed. Add players and start scoring in seconds.
        </p>
      </div>
    </div>
  )
}
