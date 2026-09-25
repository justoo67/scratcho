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
    <div className="relative mx-auto flex min-h-svh max-w-md flex-col overflow-y-auto overflow-x-hidden bg-[#0B132B]">
      {/* Full-bleed background — restored full vivid color */}
      <Image
        src="/basketball_court.webp"
        alt="Basketball court"
        fill
        priority
        className="object-cover"
        sizes="(max-width: 448px) 100vw, 448px"
      />

      {/* Dark gradient scrim — blends smoothly into Midnight Obsidian */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/85 to-black/30" />

      {/* Top Header: Nav + Fast Auth */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-8">
        <Link
          href="/runs"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B132B]/60 hover:bg-[#0B132B]/85 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-sm"
        >
          <span className="size-2 rounded-full bg-[#18FF9A] inline-block animate-pulse" />
          <span>Browse Past Runs</span>
        </Link>
        <UserAccountBadge />
      </div>

      {/* Content pinned to bottom */}
      <div className="relative mt-auto flex flex-col gap-5 px-6 pb-12 pt-16 z-10">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-white">
            Scratcho<span className="text-[#18FF9A]">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/70">
            Pickup basketball stats, courtside.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/runs/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full bg-[#146CFF] text-white text-sm hover:bg-[#146CFF]/90 font-semibold shadow-lg shadow-[#146CFF]/25 border border-white/10"
            )}
          >
            Start a New Run
          </Link>
          <Link
            href="/games/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 w-full border-white/20 bg-[#0B132B]/60 text-white text-sm hover:bg-[#0B132B]/90 hover:border-[#18FF9A]/50 backdrop-blur-md font-medium"
            )}
          >
            Quick Game (no run)
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/runs"
            className="text-xs text-white/70 hover:text-[#18FF9A] underline underline-offset-4 transition-colors py-1"
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
