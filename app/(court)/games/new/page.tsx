import { CreateGameForm } from "@/components/games/create-game-form"

export default async function NewGamePage({
  searchParams,
}: {
  searchParams: Promise<{ runId?: string }>
}) {
  const { runId } = await searchParams

  return (
    <div className="flex flex-col gap-6 px-4 pt-12 pb-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          New Game
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Set up the game</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add players, assign teams, then start scoring.
        </p>
      </div>
      <CreateGameForm runId={runId} />
    </div>
  )
}
