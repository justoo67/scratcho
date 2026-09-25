import { notFound } from "next/navigation"
import { getPlayer, getPlayerStats } from "@/lib/players/actions"
import { PlayerProfileView } from "@/components/players/player-profile-view"
import { toPlain } from "@/lib/utils"

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params
  const [player, career] = await Promise.all([
    getPlayer(playerId),
    getPlayerStats(playerId),
  ])

  if (!player) notFound()

  return <PlayerProfileView player={toPlain(player)} career={toPlain(career)} />
}
