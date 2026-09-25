import { notFound } from "next/navigation"
import Link from "next/link"
import { getRun } from "@/lib/runs/actions"
import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/court/page-header"
import { cn } from "@/lib/utils"

export default async function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>
}) {
  const { runId } = await params
  const run = await getRun(runId)

  if (!run) notFound()

  return (
    <div className="flex flex-col gap-6 px-4 pt-8 pb-8">
      <PageHeader
        eyebrow="Run"
        title={run.name}
        subtitle={run.location ?? undefined}
      />

      <Link
        href={`/games/new?runId=${run.id}`}
        className={cn(buttonVariants({ size: "lg" }), "w-full h-12 text-sm")}
      >
        Start New Game
      </Link>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Recent Games
        </h2>
        <p className="text-sm text-muted-foreground">No games yet.</p>
      </section>
    </div>
  )
}
