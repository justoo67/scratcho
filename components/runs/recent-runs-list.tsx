"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRightIcon, MapPinIcon, FlameIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RunSummary {
  id: string
  name: string
  location?: string | null
  gamesCount?: number
  createdAt?: Date | string
}

interface Props {
  initialRuns: RunSummary[]
}

export function RecentRunsList({ initialRuns }: Props) {
  const [runs, setRuns] = useState<RunSummary[]>(initialRuns)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem("scratcho_recent_runs")
      if (!stored) return
      const localList: Array<{ id: string; name: string; location?: string | null }> = JSON.parse(stored)
      if (!Array.isArray(localList) || localList.length === 0) return

      // Merge local recently visited runs with server runs
      setRuns((prev) => {
        const map = new Map<string, RunSummary>()
        // Put local runs first (most recently visited)
        for (const local of localList) {
          const match = prev.find((r) => r.id === local.id)
          map.set(local.id, {
            id: local.id,
            name: local.name || match?.name || "Recurring Run",
            location: local.location || match?.location,
            gamesCount: match?.gamesCount ?? 0,
          })
        }
        // Then add other server runs
        for (const s of prev) {
          if (!map.has(s.id)) {
            map.set(s.id, s)
          }
        }
        return Array.from(map.values()).slice(0, 5)
      })
    } catch {
      // Ignore parse errors
    }
  }, [])

  if (runs.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <FlameIcon className="size-3.5 text-amber-400" />
          <span>Recent Runs</span>
        </span>
        <span className="text-[10px] text-white/50">
          Pick up where you left off
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {runs.map((run) => (
          <Link
            key={run.id}
            href={`/runs/${run.id}`}
            className={cn(
              "group flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all active:scale-[0.99] hover:bg-white/15 hover:border-white/25"
            )}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate group-hover:text-white">
                {run.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-white/60">
                {run.location && (
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <MapPinIcon className="size-3 shrink-0 text-white/40" />
                    <span>{run.location}</span>
                  </span>
                )}
                {run.location && run.gamesCount !== undefined && <span>·</span>}
                {run.gamesCount !== undefined && (
                  <span>
                    {run.gamesCount} {run.gamesCount === 1 ? "game" : "games"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-medium text-white/70 group-hover:text-white shrink-0">
              <span>View</span>
              <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
