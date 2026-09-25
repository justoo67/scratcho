import { notFound } from "next/navigation"
import { getGame } from "@/lib/games/actions"
import { getGameTotals } from "@/lib/scoring/actions"
import { db } from "@/db"
import { ScoreBoard } from "@/components/court/score-board"
import { toPlain } from "@/lib/utils"

export default async function ScorePage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  const game = await getGame(gameId)
  if (!game) notFound()
  if (game.status === "finished") {
    // Redirect handled client-side via the ScoreBoard component
  }

  const [totals, gamePlayers, teams, statDefs] = await Promise.all([
    getGameTotals(gameId),
    db.query.gamePlayers.findMany({
      where: (gp, { eq }) => eq(gp.gameId, gameId),
    }),
    db.query.teams.findMany({
      where: (t, { eq }) => eq(t.gameId, gameId),
    }),
    db.query.statDefinitions.findMany(),
  ])

  const playerIds = [...new Set(gamePlayers.map((gp) => gp.playerId))]
  const players =
    playerIds.length > 0
      ? await db.query.players.findMany({
          where: (p, { inArray }) => inArray(p.id, playerIds),
        })
      : []

  return (
    <ScoreBoard
      game={toPlain(game)}
      teams={toPlain(teams)}
      gamePlayers={toPlain(gamePlayers)}
      players={toPlain(players)}
      statDefinitions={toPlain(statDefs)}
      initialTotals={toPlain(totals)}
    />
  )
}
