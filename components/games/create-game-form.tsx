"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, XIcon, UsersIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createGame, startGame } from "@/lib/games/actions"
import { createPlayer } from "@/lib/players/actions"
import { ulid } from "@/lib/ulid"

type PlayerDraft = { tempId: string; name: string; teamSlot: "A" | "B" }

export function CreateGameForm({ runId }: { runId?: string }) {
  const router = useRouter()
  const [players, setPlayers] = useState<PlayerDraft[]>([])
  const [nameInput, setNameInput] = useState("")
  const [teamSlot, setTeamSlot] = useState<"A" | "B">("A")

  // Customizable team names — default to Team A and Team B
  const [teamAName, setTeamAName] = useState("Team A")
  const [teamBName, setTeamBName] = useState("Team B")

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

    const resolvedTeamAName = teamAName.trim() || "Team A"
    const resolvedTeamBName = teamBName.trim() || "Team B"

    try {
      // Use first Team A player as the owner/scorer for MVP
      const ownerPlayer = await createPlayer({ name: teamA[0].name })

      const game = await createGame({
        runId,
        ownerPlayerId: ownerPlayer.id,
      })

      // Create both teams with custom names
      const [teamARow, teamBRow] = await Promise.all([
        fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, name: resolvedTeamAName }),
        }).then((r) => r.json()),
        fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id, name: resolvedTeamBName }),
        }).then((r) => r.json()),
      ])

      // Create all players and assign to teams
      const allPlayerCreates = players.map(async (draft) => {
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
    } catch {
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const resolvedSlotAName = teamAName.trim() || "Team A"
  const resolvedSlotBName = teamBName.trim() || "Team B"

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Customizable Team Names (Defaults: Team A & Team B) */}
      <div className="rounded-lg border border-border bg-card p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <UsersIcon className="size-3.5" />
          <span>Team Names</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="teamA" className="text-[11px] font-medium text-muted-foreground">
              Team A (Home)
            </Label>
            <Input
              id="teamA"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="Team A"
              maxLength={24}
              className="h-8 text-xs font-semibold"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="teamB" className="text-[11px] font-medium text-muted-foreground">
              Team B (Away)
            </Label>
            <Input
              id="teamB"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="Team B"
              maxLength={24}
              className="h-8 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 2. Add player input */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs">Add players</Label>
        <div className="flex gap-2">
          <div className="flex flex-1 rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setTeamSlot("A")}
              className={`px-3 text-xs font-semibold transition-colors truncate max-w-[90px] ${
                teamSlot === "A"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title={resolvedSlotAName}
            >
              {resolvedSlotAName}
            </button>
            <button
              type="button"
              onClick={() => setTeamSlot("B")}
              className={`px-3 text-xs font-semibold transition-colors border-l border-border truncate max-w-[90px] ${
                teamSlot === "B"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title={resolvedSlotBName}
            >
              {resolvedSlotBName}
            </button>
            <Input
              className="flex-1 border-0 rounded-none focus-visible:ring-0 h-9 text-xs"
              placeholder="Player name (e.g. Brian)"
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

      {/* 3. Team rosters */}
      {players.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {(["A", "B"] as const).map((slot) => {
            const roster = players.filter((p) => p.teamSlot === slot)
            const teamTitle = slot === "A" ? resolvedSlotAName : resolvedSlotBName

            return (
              <div key={slot} className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                    {teamTitle}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {roster.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {roster.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 italic py-2">No players yet</p>
                  ) : (
                    roster.map((p) => (
                      <div
                        key={p.tempId}
                        className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5"
                      >
                        <button
                          type="button"
                          className="flex-1 text-left text-xs font-medium truncate"
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

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        className="h-12 w-full text-sm font-semibold"
        onClick={handleStart}
        disabled={isSubmitting || players.length < 2}
      >
        {isSubmitting ? "Starting Game…" : "Start Game"}
      </Button>
    </div>
  )
}
