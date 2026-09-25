import { notFound } from "next/navigation"
import { getGame } from "@/lib/games/actions"
import { getGameTotals } from "@/lib/scoring/actions"
import { db } from "@/db"
import { GameResult } from "@/components/court/game-result"
import { toPlain } from "@/lib/utils"

export default async function ResultPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  const game = await getGame(gameId)
  if (!game) notFound()

  const [totals, gamePlayers, teams] = await Promise.all([
    getGameTotals(gameId),
    db.query.gamePlayers.findMany({
      where: (gp, { eq }) => eq(gp.gameId, gameId),
    }),
    db.query.teams.findMany({
      where: (t, { eq }) => eq(t.gameId, gameId),
    }),
  ])

  const playerIds = [...new Set(gamePlayers.map((gp) => gp.playerId))]
  const players =
    playerIds.length > 0
      ? await db.query.players.findMany({
          where: (p, { inArray }) => inArray(p.id, playerIds),
        })
      : []

  const statDefs = await db.query.statDefinitions.findMany()

  return (
    <GameResult
      game={toPlain(game)}
      teams={toPlain(teams)}
      gamePlayers={toPlain(gamePlayers)}
      players={toPlain(players)}
      statDefinitions={toPlain(statDefs)}
      totals={toPlain(totals)}
    />
  )
}
