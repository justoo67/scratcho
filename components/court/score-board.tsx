"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDownIcon, UndoIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { finishGame } from "@/lib/games/actions"
import { ulid } from "@/lib/ulid"
import {
  queueStatEvent,
  voidLocalEvent,
  getUnsyncedEvents,
  markEventSynced,
  type PendingStatEvent,
} from "@/lib/sync/offline-queue"
import type { Game, Team, StatDefinition } from "@/db/schema"
import type { GamePlayer, Player } from "@/db/schema"

type Totals = { playerId: string; statId: string; total: number }[]

interface Props {
  game: Game
  teams: Team[]
  gamePlayers: GamePlayer[]
  players: Player[]
  statDefinitions: StatDefinition[]
  initialTotals: Totals
}

export function ScoreBoard({
  game,
  teams,
  gamePlayers,
  players,
  statDefinitions,
  initialTotals,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Local totals — start from server values, updated optimistically
  const [totals, setTotals] = useState<Map<string, Map<string, number>>>(() => {
    const map = new Map<string, Map<string, number>>()
    for (const { playerId, statId, total } of initialTotals) {
      if (!map.has(playerId)) map.set(playerId, new Map())
      map.get(playerId)!.set(statId, total)
    }
    return map
  })

  // Last recorded event — for undo
  const [lastEvent, setLastEvent] = useState<PendingStatEvent | null>(null)
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  // Sync unsynced events on mount and periodically
  useEffect(() => {
    syncPendingEvents(game.id)
    const interval = setInterval(() => syncPendingEvents(game.id), 5000)
    return () => clearInterval(interval)
  }, [game.id])

  async function syncPendingEvents(gameId: string) {
    const pending = await getUnsyncedEvents(gameId)
    for (const evt of pending) {
      try {
        const res = await fetch("/api/stat-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evt),
        })
        if (res.ok) await markEventSynced(evt.id)
      } catch {
        // offline — will retry next interval
      }
    }
  }

  function getTotal(playerId: string, statId: string) {
    return totals.get(playerId)?.get(statId) ?? 0
  }

  function applyDelta(playerId: string, statId: string, delta: number) {
    setTotals((prev) => {
      const next = new Map(prev)
      const playerMap = new Map(next.get(playerId) ?? [])
      playerMap.set(statId, (playerMap.get(statId) ?? 0) + delta)
      next.set(playerId, playerMap)
      return next
    })
  }

  async function recordStat(playerId: string, statId: string, value: number) {
    const event: PendingStatEvent = {
      id: ulid(),
      gameId: game.id,
      playerId,
      statId,
      value,
      scorerPlayerId: game.activeScorerPlayerId ?? undefined,
      scorerSessionId: game.scorerSessionId ?? undefined,
      recordedAt: Date.now(),
      synced: false,
      voided: false,
    }

    // Optimistic update
    applyDelta(playerId, statId, value)
    setLastEvent(event)
    setExpandedPlayer(null)

    // Queue for sync (works offline)
    await queueStatEvent(event)

    // Try to sync immediately
    try {
      const res = await fetch("/api/stat-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })
      if (res.ok) await markEventSynced(event.id)
    } catch {
      // queued — will sync when online
    }
  }

  async function undoLast() {
    if (!lastEvent) return
    // Reverse the optimistic update
    applyDelta(lastEvent.playerId, lastEvent.statId, -lastEvent.value)
    // Void locally
    await voidLocalEvent(lastEvent.id)
    // Void on server
    try {
      await fetch("/api/stat-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: lastEvent.id, reason: "undo" }),
      })
    } catch {
      // will be reconciled later
    }
    setLastEvent(null)
  }

  function handleFinish() {
    startTransition(async () => {
      await finishGame(game.id)
      router.push(`/games/${game.id}/result`)
    })
  }

  // Compute team scores (points only — stat code "PTS")
  const ptsStat = statDefinitions.find((s) => s.code === "PTS")

  function teamScore(teamId: string) {
    if (!ptsStat) return 0
    return gamePlayers
      .filter((gp) => gp.teamId === teamId)
      .reduce((sum, gp) => sum + getTotal(gp.playerId, ptsStat.id), 0)
  }

  return (
    <div className="flex flex-col min-h-svh">
      {/* Scoreboard header */}
      <div className="bg-primary text-primary-foreground px-4 py-5">
        <div className="flex items-center justify-between">
          {teams.map((team, i) => (
            <div
              key={team.id}
              className={`flex flex-col ${i === 1 ? "items-end" : "items-start"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                {team.name}
              </p>
              <p className="text-5xl font-bold tabular-nums leading-none mt-1">
                {teamScore(team.id)}
              </p>
            </div>
          ))}
          <div className="text-xs font-semibold uppercase tracking-widest opacity-50">
            vs
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <button
          onClick={undoLast}
          disabled={!lastEvent}
          className="flex items-center gap-1.5 text-xs text-muted-foreground disabled:opacity-30"
        >
          <UndoIcon className="size-3.5" />
          Undo
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFinish}
          disabled={isPending}
          className="text-xs"
        >
          <CheckIcon className="size-3.5" />
          {isPending ? "Finishing…" : "Finish Game"}
        </Button>
      </div>

      {/* Player cards by team */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {teams.map((team) => {
          const teamPlayerIds = gamePlayers
            .filter((gp) => gp.teamId === team.id)
            .map((gp) => gp.playerId)
          const teamPlayers = players.filter((p) =>
            teamPlayerIds.includes(p.id)
          )

          return (
            <section key={team.id}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {team.name}
              </h2>
              <div className="flex flex-col gap-2">
                {teamPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    statDefinitions={statDefinitions}
                    totals={totals.get(player.id) ?? new Map()}
                    isExpanded={expandedPlayer === player.id}
                    onToggle={() =>
                      setExpandedPlayer((prev) =>
                        prev === player.id ? null : player.id
                      )
                    }
                    onStat={(statId, value) =>
                      recordStat(player.id, statId, value)
                    }
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function PlayerCard({
  player,
  statDefinitions,
  totals,
  isExpanded,
  onToggle,
  onStat,
}: {
  player: Player
  statDefinitions: StatDefinition[]
  totals: Map<string, number>
  isExpanded: boolean
  onToggle: () => void
  onStat: (statId: string, value: number) => void
}) {
  const ptsStat = statDefinitions.find((s) => s.code === "PTS")

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Player row — tap to expand */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 active:bg-muted transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
            {player.name[0].toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-tight">{player.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {statDefinitions
                .slice(0, 3)
                .map((s) => `${totals.get(s.id) ?? 0} ${s.code}`)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ptsStat && (
            <span className="text-lg font-bold tabular-nums">
              {totals.get(ptsStat.id) ?? 0}
            </span>
          )}
          <ChevronDownIcon
            className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Stat action buttons — expanded */}
      {isExpanded && (
        <div className="border-t border-border px-3 py-3 grid grid-cols-3 gap-2">
          {/* Points buttons */}
          {ptsStat && (
            <>
              {[1, 2, 3].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => onStat(ptsStat.id, pts)}
                  className="rounded-md bg-primary text-primary-foreground py-3 text-sm font-semibold active:opacity-80 transition-opacity"
                >
                  +{pts} PT{pts > 1 ? "S" : ""}
                </button>
              ))}
            </>
          )}
          {/* Other stats */}
          {statDefinitions
            .filter((s) => s.code !== "PTS")
            .map((stat) => (
              <button
                key={stat.id}
                type="button"
                onClick={() => onStat(stat.id, stat.defaultValue)}
                className="rounded-md bg-muted text-foreground py-3 text-sm font-semibold active:opacity-80 transition-opacity"
              >
                {stat.code} +
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
