import Image from "next/image"
import { ShieldCheckIcon, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatHighlight {
  label: string
  value: string | number
  sublabel?: string
}

export interface PlayerStatsCardProps {
  player: {
    id: string
    name: string
    nickname?: string | null
    jerseyNumber?: string | null
    photoUrl?: string | null
    claimedByUserId?: string | null
  }
  stats?: StatHighlight[]
  career?: {
    totalGames: number
    stats: Array<{
      id: string
      code: string
      name: string
      total: number
      perGame: string
      label: string
    }>
  }
  /** Path to an image in the public folder, e.g. "/basketball_court.webp", "/A dunk.webp" */
  backgroundImage?: string
  className?: string
  priority?: boolean
}

export function PlayerStatsCard({
  player,
  stats: customStats,
  career,
  backgroundImage = "/basketball_court.webp",
  className,
  priority = false,
}: PlayerStatsCardProps) {
  // Extract or compute top bold stats for the left edge
  const displayStats: StatHighlight[] = (() => {
    if (customStats && customStats.length > 0) {
      return customStats.slice(0, 4)
    }

    if (career) {
      const pts = career.stats.find((s) => s.code === "PTS" || s.id === "PTS")
      const reb = career.stats.find((s) => s.code === "REB" || s.id === "REB")
      const ast = career.stats.find((s) => s.code === "AST" || s.id === "AST")

      const items: StatHighlight[] = [
        {
          label: "PPG",
          value: pts?.perGame ?? "0.0",
          sublabel: `${pts?.total ?? 0} pts`,
        },
      ]

      if (reb) {
        items.push({
          label: "RPG",
          value: reb.perGame,
          sublabel: `${reb.total} reb`,
        })
      }

      if (ast) {
        items.push({
          label: "APG",
          value: ast.perGame,
          sublabel: `${ast.total} ast`,
        })
      }

      items.push({
        label: "GP",
        value: career.totalGames,
        sublabel: "games",
      })

      return items.slice(0, 4)
    }

    // Fallback if no stats provided
    return [
      { label: "PPG", value: "--", sublabel: "pts" },
      { label: "GP", value: "0", sublabel: "games" },
    ]
  })()

  const isClaimed = Boolean(player.claimedByUserId)
  const initial = player.name?.[0]?.toUpperCase() || "P"
  const jersey = player.jerseyNumber ? `#${player.jerseyNumber}` : null

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0B132B] shadow-2xl text-white select-none",
        "min-h-[220px] sm:min-h-[240px]",
        className
      )}
    >
      {/* 1. Background Image from public folder */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Card Background"
          fill
          priority={priority}
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover object-center opacity-40 filter contrast-125"
        />
        {/* Dark base scrim to preserve contrast across diverse wallpapers */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/80 to-[#0B132B]/40" />
      </div>

      {/* 2. Stats Background Overlay: Fades smoothly from left edge into the card */}
      <div className="absolute inset-y-0 left-0 w-3/4 sm:w-2/3 bg-gradient-to-r from-[#0B132B]/95 via-[#0B132B]/85 to-transparent z-10 pointer-events-none" />

      {/* 3. Card Content Grid */}
      <div className="relative z-20 flex h-full min-h-[220px] sm:min-h-[240px] flex-col justify-between p-4 sm:p-5">
        {/* Top Bar: Brand tag & Claim Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded bg-[#18FF9A] text-[9px] font-black text-black">
              S
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              Scratcho Card
            </span>
          </div>

          <div>
            {isClaimed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-xs">
                <ShieldCheckIcon className="size-3" />
                <span>Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] font-medium text-white/60 backdrop-blur-xs">
                <UserIcon className="size-3" />
                <span>Guest</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Section: Bold Stats on Left Edge & Image on Right */}
        <div className="grid grid-cols-12 items-center gap-2 my-auto py-1">
          {/* Left Edge: Bold Stats */}
          <div className="col-span-6 sm:col-span-5 flex flex-col gap-2.5">
            {displayStats.map((stat, idx) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "font-black tracking-tight tabular-nums leading-none",
                      idx === 0
                        ? "text-3xl sm:text-4xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                        : "text-xl sm:text-2xl text-white/90"
                    )}
                  >
                    {stat.value}
                  </span>
                  {stat.sublabel && (
                    <span className="text-[9px] text-white/50 tracking-tight leading-none mt-0.5">
                      {stat.sublabel}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    idx === 0 ? "text-[#18FF9A]" : "text-white/60"
                  )}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Right Section: Space for Player Image or Stylized Default Graphic */}
          <div className="col-span-6 sm:col-span-7 relative h-32 sm:h-36 flex items-center justify-end">
            {player.photoUrl ? (
              // Case A: Custom Player Image
              <div className="relative h-full w-28 sm:w-36 overflow-hidden rounded-xl border border-white/20 shadow-xl bg-black/30">
                <Image
                  src={player.photoUrl}
                  alt={player.name}
                  fill
                  sizes="144px"
                  className="object-cover object-top"
                />
                {/* Subtle edge blend overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 via-transparent to-transparent" />
              </div>
            ) : (
              // Case B: Default design (No player image)
              <div className="relative flex h-full w-full items-center justify-end">
                {/* Giant watermark number / initial in background */}
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-7xl sm:text-8xl font-black italic tracking-tighter text-white/10 pointer-events-none select-none">
                  {jersey || initial}
                </span>

                {/* Prominent monogram emblem */}
                <div className="relative z-10 flex size-20 sm:size-24 flex-col items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(24,255,154,0.12)] ring-1 ring-[#18FF9A]/30">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                    {initial}
                  </span>
                  {jersey && (
                    <span className="mt-0.5 font-mono text-[10px] font-bold text-[#18FF9A] tracking-wider">
                      {jersey}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Banner: Player Nameplate */}
        <div className="pt-2 border-t border-white/15 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white truncate drop-shadow-sm">
              {player.name}
            </h3>
            {player.nickname ? (
              <p className="text-xs font-semibold italic text-[#18FF9A] truncate">
                &ldquo;{player.nickname}&rdquo;
              </p>
            ) : (
              <p className="text-[11px] text-white/50 uppercase tracking-wider">
                Pickup Athlete
              </p>
            )}
          </div>

          {jersey && (
            <div className="shrink-0 text-right">
              <span className="font-mono text-lg sm:text-xl font-black text-white/90 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                {jersey}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
