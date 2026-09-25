"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  TrophyIcon, 
  MapPinIcon, 
  Share2Icon, 
  CheckIcon, 
  PlayIcon, 
  ChevronRightIcon, 
  UsersIcon,
  FlameIcon
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TeamInfo {
  id: string
  name: string
  score: number
}

interface GameItem {
  id: string
  gameNumber: number
  status: "setup" | "active" | "finished"
  startedAt: Date | string | null
  finishedAt: Date | string | null
  createdAt: Date | string
  teamA: TeamInfo
  teamB: TeamInfo
  winnerId: string | null
  winnerName: string | null
}

interface RunData {
  run: {
    id: string
    name: string
    location?: string | null
    createdAt: Date | string
  }
  totalGames: number
  finishedGamesCount: number
  teamWins: Record<string, number>
  games: GameItem[]
  regularPlayers: Array<{
    id: string
    name: string
    nickname?: string | null
    jerseyNumber?: string | null
  }>
}

export function RunView({ data }: { data: RunData }) {
  const [copied, setCopied] = useState(false)
  const { run, totalGames, finishedGamesCount, teamWins, games, regularPlayers } = data

  // Store in localStorage for fast 1-tap re-entry from home screen
  useEffect(() => {
    if (typeof window === "undefined" || !run.id) return
    try {
      const stored = localStorage.getItem("scratcho_recent_runs")
      let list: Array<{ id: string; name: string; location?: string | null; visitedAt: number }> = []
      if (stored) {
        list = JSON.parse(stored)
      }
      list = list.filter((item) => item.id !== run.id)
      list.unshift({
        id: run.id,
        name: run.name,
        location: run.location,
        visitedAt: Date.now(),
      })
      localStorage.setItem("scratcho_recent_runs", JSON.stringify(list.slice(0, 8)))
    } catch {
      // Ignore localStorage storage errors
    }
  }, [run])

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${run.name} · Scratcho`,
          text: `Check out the run history and stats for ${run.name} on Scratcho:`,
          url,
        })
        return
      } catch {
        // Fall back to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const activeGame = games.find((g) => g.status === "active" || g.status === "setup")

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
            Recurring Run
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
            {run.name}
          </h1>
          {run.location && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span>{run.location}</span>
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="shrink-0 gap-1.5 text-xs h-9 px-3 border-border/60 hover:bg-muted/50"
        >
          {copied ? (
            <>
              <CheckIcon className="size-3.5 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2Icon className="size-3.5 text-muted-foreground" />
              <span>Share</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Action Button */}
      {activeGame ? (
        <div className="flex flex-col gap-2">
          <Link
            href={`/games/${activeGame.id}/score`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 w-full bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            )}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>Resume Game #{activeGame.gameNumber}</span>
          </Link>
          <Link
            href={`/games/new?runId=${run.id}`}
            className="text-center text-xs text-muted-foreground hover:underline py-1"
          >
            Or start a separate new game
          </Link>
        </div>
      ) : (
        <Link
          href={`/games/new?runId=${run.id}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-13 w-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 flex items-center justify-center gap-2"
          )}
        >
          <PlayIcon className="size-4 fill-current" />
          <span>Start Next Game</span>
        </Link>
      )}

      {/* Run Summary / Head-to-Head Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Total Games
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {totalGames}
            </span>
            <span className="text-xs text-muted-foreground">
              ({finishedGamesCount} finished)
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <TrophyIcon className="size-3 text-amber-500" />
            <span>Head-to-Head</span>
          </span>
          <div className="mt-2 flex flex-col gap-0.5">
            {Object.keys(teamWins).length > 0 ? (
              Object.entries(teamWins).map(([teamName, wins]) => (
                <div key={teamName} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground truncate max-w-[80px]">
                    {teamName}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground/90">
                    {wins} {wins === 1 ? "win" : "wins"}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No results yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Regular Roster / Players */}
      {regularPlayers.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UsersIcon className="size-3.5" />
              <span>Run Roster ({regularPlayers.length})</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {regularPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 hover:bg-muted text-foreground border border-border/40 transition-colors"
              >
                <span>{player.nickname || player.name}</span>
                {player.jerseyNumber && (
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    #{player.jerseyNumber}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Games History List */}
      <section className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Game History
          </h2>
          <span className="text-xs text-muted-foreground">
            {games.length} {games.length === 1 ? "game" : "games"} recorded
          </span>
        </div>

        {games.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 p-8 text-center">
            <FlameIcon className="mx-auto size-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">No games recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
              Tap &quot;Start Next Game&quot; above to set up teams and start recording stats courtside.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {games.map((g) => {
              const isFinished = g.status === "finished"
              const isActive = g.status === "active"
              const destination = isFinished
                ? `/games/${g.id}/result`
                : `/games/${g.id}/score`

              const dateStr = new Date(g.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })

              return (
                <Link
                  key={g.id}
                  href={destination}
                  className={cn(
                    "flex flex-col gap-2.5 rounded-xl border p-4 transition-all active:scale-[0.99]",
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                  )}
                >
                  {/* Card Top: Game # & Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Game #{g.gameNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {dateStr}
                      </span>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-muted-foreground capitalize">
                          {g.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Middle: Scores and Teams */}
                  <div className="flex items-center justify-between pt-1 pb-1">
                    {/* Team A */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            g.winnerId === g.teamA.id
                              ? "font-bold text-foreground"
                              : "text-foreground/80"
                          )}
                        >
                          {g.teamA.name}
                        </span>
                        {g.winnerId === g.teamA.id && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500">
                            W
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-2xl font-bold tabular-nums tracking-tight mt-0.5",
                          g.winnerId === g.teamA.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {g.teamA.score}
                      </span>
                    </div>

                    <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase">
                      vs
                    </div>

                    {/* Team B */}
                    <div className="flex-1 flex flex-col items-end text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {g.winnerId === g.teamB.id && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500">
                            W
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            g.winnerId === g.teamB.id
                              ? "font-bold text-foreground"
                              : "text-foreground/80"
                          )}
                        >
                          {g.teamB.name}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-2xl font-bold tabular-nums tracking-tight mt-0.5",
                          g.winnerId === g.teamB.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {g.teamB.score}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom: Link indicator */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                    <span>
                      {isFinished ? "View full box score & stats" : "Tap to continue scoring"}
                    </span>
                    <ChevronRightIcon className="size-3.5 text-muted-foreground/60" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
