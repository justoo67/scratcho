"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Share2Icon, 
  CheckIcon, 
  HomeIcon, 
  PlayIcon, 
  TrophyIcon 
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Game, Team, StatDefinition } from "@/db/schema"
import type { GamePlayer, Player } from "@/db/schema"

type Totals = { playerId: string; statId: string; total: number }[]

interface Props {
  game: Game
  teams: Team[]
  gamePlayers: GamePlayer[]
  players: Player[]
  statDefinitions: StatDefinition[]
  totals: Totals
}

export function GameResult({
  game,
  teams,
  gamePlayers,
  players,
  statDefinitions,
  totals,
}: Props) {
  const [copied, setCopied] = useState(false)

  function getTotal(playerId: string, statId: string) {
    return totals.find((t) => t.playerId === playerId && t.statId === statId)?.total ?? 0
  }

  const ptsStat = statDefinitions.find((s) => s.code === "PTS")

  function teamScore(teamId: string) {
    if (!ptsStat) return 0
    return gamePlayers
      .filter((gp) => gp.teamId === teamId)
      .reduce((sum, gp) => sum + getTotal(gp.playerId, ptsStat.id), 0)
  }

  const scores = teams.map((t) => ({ team: t, score: teamScore(t.id) }))
  const winner = scores.reduce((a, b) => (a.score >= b.score ? a : b))

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const scoreLines = scores.map((s) => `${s.team.name}: ${s.score}`).join(" — ")
    const topScorers = players
      .map((p) => ({ name: p.name, pts: ptsStat ? getTotal(p.id, ptsStat.id) : 0 }))
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 3)
      .map((p) => `${p.name} (${p.pts} PTS)`)
      .join(", ")

    const shareText = `🏀 Scratcho Pickup Basketball\n${scoreLines} (Winner: ${winner.team.name})\nTop Scorers: ${topScorers}\n\nView Box Score: ${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Game Result · Scratcho`,
          text: shareText,
          url,
        })
        return
      } catch {
        // Fall back to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="flex flex-col min-h-svh pb-12">
      {/* Result header */}
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-8 text-center relative">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
          Final Score
        </p>
        <div className="flex items-center justify-center gap-6 mt-3">
          {scores.map(({ team, score }) => (
            <div key={team.id} className="flex flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                {team.name}
              </p>
              <p className="text-6xl font-bold tabular-nums leading-none mt-1">
                {score}
              </p>
              {team.id === winner.team.id && (
                <Badge className="mt-2 text-[10px]" variant="secondary">
                  Winner
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Per-team stats */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-6">
        {teams.map((team) => {
          const teamPlayerIds = gamePlayers
            .filter((gp) => gp.teamId === team.id)
            .map((gp) => gp.playerId)
          const teamPlayers = players
            .filter((p) => teamPlayerIds.includes(p.id))
            .sort(
              (a, b) =>
                (ptsStat ? getTotal(b.id, ptsStat.id) : 0) -
                (ptsStat ? getTotal(a.id, ptsStat.id) : 0)
            )

          return (
            <section key={team.id}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {team.name}
              </h2>
              <div className="flex flex-col gap-2">
                {teamPlayers.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {player.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{player.name}</p>
                        {!player.claimedByUserId && (
                          <span className="text-[10px] text-primary font-medium">
                            Claim profile →
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {statDefinitions
                        .map((s) => `${getTotal(player.id, s.id)} ${s.code}`)
                        .join(" · ")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <Separator />

      {/* Action Buttons: Save, Return Home, Next Game */}
      <div className="px-4 py-5 flex flex-col gap-3">
        {/* Share & Save Score Sheet */}
        <Button
          type="button"
          onClick={handleShare}
          variant="outline"
          className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 border-border/80"
        >
          {copied ? (
            <>
              <CheckIcon className="size-4 text-emerald-500" />
              <span className="text-emerald-500">Score Sheet Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2Icon className="size-4" />
              <span>Share &amp; Save Score Sheet</span>
            </>
          )}
        </Button>

        {/* Run-based Next Game or New Game */}
        {game.runId ? (
          <>
            <Link
              href={`/games/new?runId=${game.runId}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full h-12 text-sm font-semibold flex items-center justify-center gap-2")}
            >
              <PlayIcon className="size-4 fill-current" />
              <span>Start Next Game in Run</span>
            </Link>

            <Link
              href={`/runs/${game.runId}`}
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full h-11 text-sm font-medium flex items-center justify-center gap-2")}
            >
              <TrophyIcon className="size-4" />
              <span>Back to Run History</span>
            </Link>
          </>
        ) : (
          <Link
            href="/games/new"
            className={cn(buttonVariants({ size: "lg" }), "w-full h-12 text-sm font-semibold flex items-center justify-center gap-2")}
          >
            <PlayIcon className="size-4 fill-current" />
            <span>Start Another Game</span>
          </Link>
        )}

        {/* Return to Home */}
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full h-11 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          )}
        >
          <HomeIcon className="size-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  )
}
