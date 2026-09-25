"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
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

  return (
    <div className="flex flex-col min-h-svh">
      {/* Result header */}
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
          Final Score
        </p>
        <div className="flex items-center justify-center gap-6 mt-3">
          {scores.map(({ team, score }, i) => (
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
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {player.name[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-medium">{player.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statDefinitions
                        .map((s) => `${getTotal(player.id, s.id)} ${s.code}`)
                        .join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <Separator />

      <div className="px-4 py-5 flex flex-col gap-3">
        {game.runId && (
          <Link
            href={`/runs/${game.runId}`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full h-11")}
          >
            Back to Run
          </Link>
        )}
        <Link
          href="/runs/new"
          className={cn(buttonVariants(), "w-full h-11")}
        >
          New Run
        </Link>
      </div>
    </div>
  )
}
