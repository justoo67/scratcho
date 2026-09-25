import { getAllRuns } from "@/lib/runs/actions"
import { RunsDirectory } from "@/components/runs/runs-directory"
import { toPlain } from "@/lib/utils"

export default async function RunsPage() {
  const allRuns = await getAllRuns().catch(() => [])

  return <RunsDirectory initialRuns={toPlain(allRuns)} />
}
