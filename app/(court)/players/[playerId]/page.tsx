import { notFound } from "next/navigation"
import { getPlayer } from "@/lib/players/actions"
import { PageHeader } from "@/components/court/page-header"

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params
  const player = await getPlayer(playerId)
  if (!player) notFound()

  return (
    <div className="flex flex-col gap-6 px-4 pt-8 pb-8">
      <PageHeader
        eyebrow="Player"
        title={player.name}
        subtitle={player.nickname ? `"${player.nickname}"` : undefined}
      />

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Career Stats
        </h2>
        <p className="text-sm text-muted-foreground">
          Play more games to see your history here.
        </p>
      </section>
    </div>
  )
}
