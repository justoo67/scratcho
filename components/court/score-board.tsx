"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  UndoIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  MinusIcon,
} from "lucide-react"
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

  // Track active team tab to avoid vertical scrolling
  const [activeTeamId, setActiveTeamId] = useState<string>(
    teams[0]?.id || ""
  )

  // Local totals map: playerId -> (statId -> total)
  const [totals, setTotals] = useState<Map<string, Map<string, number>>>(() => {
    const map = new Map<string, Map<string, number>>()
    for (const { playerId, statId, total } of initialTotals) {
      if (!map.has(playerId)) map.set(playerId, new Map())
      map.get(playerId)!.set(statId, total)
    }
    return map
  })

  // Last recorded event with metadata for clear Undo UI
  const [lastEvent, setLastEvent] = useState<{
    event: PendingStatEvent
    playerName: string
    statCode: string
    statValue: number
  } | null>(null)

  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null)

  // Sync unsynced events periodically and on mount
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
        // offline queue will retry
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

  async function recordStat(
    player: Player,
    stat: StatDefinition,
    value: number
  ) {
    const event: PendingStatEvent = {
      id: ulid(),
      gameId: game.id,
      playerId: player.id,
      statId: stat.id,
      value,
      scorerPlayerId: game.activeScorerPlayerId ?? undefined,
      scorerSessionId: game.scorerSessionId ?? undefined,
      recordedAt: Date.now(),
      synced: false,
      voided: false,
    }

    // Optimistic update
    applyDelta(player.id, stat.id, value)
    setLastEvent({
      event,
      playerName: player.name,
      statCode: stat.code,
      statValue: value,
    })

    // Queue for offline sync
    await queueStatEvent(event)

    // Attempt background sync
    try {
      const res = await fetch("/api/stat-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })
      if (res.ok) await markEventSynced(event.id)
    } catch {
      // safely queued in Dexie
    }
  }

  async function undoLast() {
    if (!lastEvent) return
    const { event } = lastEvent
    applyDelta(event.playerId, event.statId, -event.value)
    await voidLocalEvent(event.id)

    try {
      await fetch("/api/stat-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, reason: "undo" }),
      })
    } catch {
      // offline reconcile
    }
    setLastEvent(null)
  }

  function handleFinish() {
    if (confirm("Are you sure you want to finish this game?")) {
      startTransition(async () => {
        await finishGame(game.id)
        router.push(`/games/${game.id}/result`)
      })
    }
  }

  const ptsStat = statDefinitions.find((s) => s.code === "PTS")

  function getTeamScore(teamId: string) {
    if (!ptsStat) return 0
    return gamePlayers
      .filter((gp) => gp.teamId === teamId)
      .reduce((sum, gp) => sum + getTotal(gp.playerId, ptsStat.id), 0)
  }

  // Active team roster
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0]
  const otherTeam = teams.find((t) => t.id !== activeTeam?.id)

  const activeRosterPlayerIds = gamePlayers
    .filter((gp) => gp.teamId === activeTeam?.id)
    .map((gp) => gp.playerId)

  const activeRosterPlayers = players.filter((p) =>
    activeRosterPlayerIds.includes(p.id)
  )

  return (
    <div className="flex flex-col h-svh max-h-svh overflow-hidden bg-background">
      {/* 1. Interactive Dual-Scoreboard & Team Switcher */}
      <div className="bg-primary text-primary-foreground select-none shrink-0 shadow-md">
        <div className="grid grid-cols-2 divide-x divide-primary-foreground/15">
          {teams.map((team) => {
            const isActive = team.id === activeTeam?.id
            const score = getTeamScore(team.id)

            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  setActiveTeamId(team.id)
                  setExpandedPlayerId(null)
                }}
                className={`flex flex-col items-center py-3.5 px-2 transition-all relative ${
                  isActive
                    ? "bg-primary-foreground/15"
                    : "opacity-60 hover:opacity-90 active:bg-primary-foreground/5"
                }`}
              >
                <div className="flex items-center gap-1.5 max-w-full px-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                    {team.name}
                  </span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="text-4xl font-extrabold tabular-nums tracking-tight leading-none mt-1">
                  {score}
                </span>

                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-foreground" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Compact Control Bar (Undo + Finish) */}
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2 shrink-0">
        {lastEvent ? (
          <button
            type="button"
            onClick={undoLast}
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold active:opacity-75"
          >
            <UndoIcon className="size-3.5" />
            <span>
              Undo +{lastEvent.statValue} {lastEvent.statCode} ({lastEvent.playerName})
            </span>
          </button>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            Tap player for stats
          </span>
        )}

        <div className="flex items-center gap-2">
          {otherTeam && (
            <button
              type="button"
              onClick={() => {
                setActiveTeamId(otherTeam.id)
                setExpandedPlayerId(null)
              }}
              className="text-[11px] font-semibold text-primary underline underline-offset-2"
            >
              Switch to {otherTeam.name}
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFinish}
            disabled={isPending}
            className="h-7 text-xs font-semibold px-2"
          >
            <CheckIcon className="size-3.5 mr-1" />
            {isPending ? "Finishing…" : "Finish"}
          </Button>
        </div>
      </div>

      {/* 3. Zero-Scroll Active Team Player Roster */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {activeRosterPlayers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No players assigned to {activeTeam?.name}.
          </div>
        ) : (
          activeRosterPlayers.map((player) => {
            const isExpanded = expandedPlayerId === player.id
            const playerPts = ptsStat ? getTotal(player.id, ptsStat.id) : 0

            return (
              <div
                key={player.id}
                className={`rounded-lg border transition-all ${
                  isExpanded
                    ? "border-primary/50 bg-card shadow-sm"
                    : "border-border bg-card/50 hover:bg-card"
                }`}
              >
                {/* Player Row Summary */}
                <div
                  className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                  onClick={() =>
                    setExpandedPlayerId(isExpanded ? null : player.id)
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold shrink-0">
                      {player.jerseyNumber ? `#${player.jerseyNumber}` : player.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">
                        {player.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                        {statDefinitions
                          .slice(0, 3)
                          .map((s) => `${getTotal(player.id, s.id)} ${s.code}`)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Points highlight */}
                    <div className="text-right">
                      <span className="text-xl font-bold tabular-nums leading-none">
                        {playerPts}
                      </span>
                      <span className="block text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                        PTS
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="size-4" />
                      ) : (
                        <ChevronDownIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Quick Actions Tray */}
                {isExpanded && (
                  <div className="border-t border-border/60 bg-muted/30 p-2.5 flex flex-col gap-2">
                    {/* Primary Points Row (+1, +2, +3) */}
                    {ptsStat && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((pts) => (
                          <button
                            key={pts}
                            type="button"
                            onClick={() => recordStat(player, ptsStat, pts)}
                            className="flex flex-col items-center justify-center py-2.5 rounded-md bg-primary text-primary-foreground font-bold active:scale-95 transition-transform"
                          >
                            <span className="text-base leading-none">+{pts}</span>
                            <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">
                              {pts === 1 ? "Free Throw" : pts === 2 ? "2-Pointer" : "3-Pointer"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Secondary Stats Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {statDefinitions
                        .filter((s) => s.code !== "PTS")
                        .map((stat) => {
                          const currentVal = getTotal(player.id, stat.id)
                          return (
                            <button
                              key={stat.id}
                              type="button"
                              onClick={() =>
                                recordStat(player, stat, stat.defaultValue)
                              }
                              className="flex items-center justify-between px-2.5 py-2 rounded-md border border-border bg-card hover:bg-accent text-xs font-semibold active:scale-95 transition-transform"
                            >
                              <span>{stat.code} +</span>
                              <span className="text-[11px] tabular-nums font-normal text-muted-foreground">
                                {currentVal}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
