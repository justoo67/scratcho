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

      {/* Top Header: Fast Auth */}
      <div className="relative z-10 flex justify-end px-5 pt-8">
        <UserAccountBadge />
      </div>

      {/* Content pinned to bottom */}
      <div className="relative mt-auto flex flex-col gap-6 px-6 pb-12 pt-16 z-10">
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
              "h-12 w-full bg-white text-black text-sm hover:bg-white/90"
            )}
          >
            Start a New Run
          </Link>
          <Link
            href="/games/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 w-full border-white/30 text-white text-sm hover:bg-white/10 hover:text-white"
            )}
          >
            Quick Game (no run)
          </Link>
        </div>

        <RecentRunsList initialRuns={toPlain(recentRuns)} />

        <p className="text-center text-xs text-white/40">
          No sign-up needed. Add players and start scoring in seconds.
        </p>
      </div>
    </div>
  )
}
