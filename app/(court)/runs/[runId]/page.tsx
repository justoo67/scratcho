import { notFound } from "next/navigation"
import { getRunHistory } from "@/lib/runs/actions"
import { RunView } from "@/components/runs/run-view"
import { toPlain } from "@/lib/utils"

export default async function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>
}) {
  const { runId } = await params
  const data = await getRunHistory(runId)

  if (!data || !data.run) {
    notFound()
  }

  return <RunView data={toPlain(data)} />
}
