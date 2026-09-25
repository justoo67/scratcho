"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, XIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createGame, startGame, transferScorer } from "@/lib/games/actions"
import { createPlayer } from "@/lib/players/actions"
import { db } from "@/db"
import { teams as teamsTable, gamePlayers } from "@/db/schema"
import { ulid } from "@/lib/ulid"

type PlayerDraft = { tempId: string; name: string; teamSlot: "A" | "B" }

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; gameId: string }

export function CreateGameForm({ runId }: { runId?: string }) {
  const router = useRouter()
  const [players, setPlayers] = useState<PlayerDraft[]>([])
  const [nameInput, setNameInput] = useState("")
  const [teamSlot, setTeamSlot] = useState<"A" | "B">("A")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addPlayer() {
    const name = nameInput.trim()
    if (!name) return
    setPlayers((prev) => [...prev, { tempId: ulid(), name, teamSlot }])
    setNameInput("")
  }

  function removePlayer(tempId: string) {
    setPlayers((prev) => prev.filter((p) => p.tempId !== tempId))
  }

  function toggleTeam(tempId: string) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.tempId === tempId
          ? { ...p, teamSlot: p.teamSlot === "A" ? "B" : "A" }
          : p
      )
    )
  }

  async function handleStart() {
    if (players.length < 2) {
      setError("Add at least 2 players to start.")
      return
    }
    const teamA = players.filter((p) => p.teamSlot === "A")
    const teamB = players.filter((p) => p.teamSlot === "B")
    if (teamA.length === 0 || teamB.length === 0) {
      setError("Each team needs at least one player.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Use first Team A player as the owner/scorer for now
      const ownerPlayer = await createPlayer({ name: teamA[0].name })

      const game = await createGame({
        runId,
        ownerPlayerId: ownerPlayer.id,
      })

      // Create both teams and insert them
      const [teamARow, teamBRow] = await Promise.all([
        fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, name: "Team A" }),
        }).then((r) => r.json()),
        fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, name: "Team B" }),
        }).then((r) => r.json()),
      ])

      // Create all players and assign to teams
      const allPlayerCreates = players.map(async (draft) => {
        // Skip the owner — already created
        const player =
          draft.tempId === players[0].tempId && draft.teamSlot === "A"
            ? ownerPlayer
            : await createPlayer({ name: draft.name })

        const teamId = draft.teamSlot === "A" ? teamARow.id : teamBRow.id
        await fetch("/api/game-players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, playerId: player.id, teamId }),
        })
      })

      await Promise.all(allPlayerCreates)
      await startGame(game.id)

      router.push(`/games/${game.id}/score`)
    } catch (e) {
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const teamA = players.filter((p) => p.teamSlot === "A")
  const teamB = players.filter((p) => p.teamSlot === "B")

  return (
    <div className="flex flex-col gap-6">
      {/* Add player input */}
      <div className="flex flex-col gap-3">
        <Label>Add players</Label>
        <div className="flex gap-2">
          <div className="flex flex-1 rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setTeamSlot("A")}
              className={`px-3 text-xs font-semibold transition-colors ${
                teamSlot === "A"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setTeamSlot("B")}
              className={`px-3 text-xs font-semibold transition-colors border-l border-border ${
                teamSlot === "B"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              B
            </button>
            <Input
              className="flex-1 border-0 rounded-none focus-visible:ring-0 h-9"
              placeholder="Player name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPlayer())}
            />
          </div>
          <Button type="button" size="icon" onClick={addPlayer} disabled={!nameInput.trim()}>
            <PlusIcon />
          </Button>
        </div>
      </div>

      {/* Team rosters */}
      {players.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {(["A", "B"] as const).map((slot) => {
            const roster = players.filter((p) => p.teamSlot === slot)
            return (
              <div key={slot}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Team {slot}
                </p>
                <div className="flex flex-col gap-1.5">
                  {roster.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60">Empty</p>
                  ) : (
                    roster.map((p) => (
                      <div
                        key={p.tempId}
                        className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5"
                      >
                        <button
                          type="button"
                          className="flex-1 text-left text-sm truncate"
                          onClick={() => toggleTeam(p.tempId)}
                          title="Click to switch team"
                        >
                          {p.name}
                        </button>
                        <button
                          type="button"
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => removePlayer(p.tempId)}
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        className="h-12 w-full text-sm"
        onClick={handleStart}
        disabled={isSubmitting || players.length < 2}
      >
        {isSubmitting ? "Starting…" : "Start Game"}
      </Button>
    </div>
  )
}
