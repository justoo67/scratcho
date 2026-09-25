"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  SearchIcon, 
  MapPinIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  FlameIcon,
  CalendarIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface RunItem {
  id: string
  name: string
  location?: string | null
  gamesCount: number
  createdAt: Date | string
  updatedAt?: Date | string
}

export function RunsDirectory({ initialRuns }: { initialRuns: RunItem[] }) {
  const [search, setSearch] = useState("")

  const filteredRuns = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return initialRuns
    return initialRuns.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q))
    )
  }, [search, initialRuns])

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-16">
      {/* Title & Action */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Directory
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Recurring Runs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Browse all pickup basketball runs and game histories.
          </p>
        </div>

        <Link
          href="/runs/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "shrink-0 gap-1.5 text-xs font-semibold h-9 px-3"
          )}
        >
          <PlusIcon className="size-3.5" />
          <span>New Run</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by run name or court location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 text-sm bg-card/60 border-border/70 rounded-xl"
        />
      </div>

      {/* Runs List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <span>
            {filteredRuns.length} {filteredRuns.length === 1 ? "run" : "runs"} found
          </span>
        </div>

        {filteredRuns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 p-8 text-center bg-card/30">
            <FlameIcon className="mx-auto size-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-foreground">
              {search ? "No matching runs found" : "No runs created yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
              {search
                ? "Try searching for a different keyword or check spelling."
                : "Create your group's first recurring run to start tracking games courtside."}
            </p>
            <Link
              href="/runs/new"
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-4 text-xs font-semibold gap-1.5"
              )}
            >
              <PlusIcon className="size-3.5" />
              <span>Create First Run</span>
            </Link>
          </div>
        ) : (
          filteredRuns.map((run) => {
            const dateStr = new Date(run.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })

            return (
              <Link
                key={run.id}
                href={`/runs/${run.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:bg-muted/30 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {run.name}
                    </span>
                    {run.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPinIcon className="size-3 shrink-0" />
                        <span className="truncate">{run.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5">
                    <span>History</span>
                    <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 mt-1">
                  <span className="font-semibold text-foreground/80">
                    {run.gamesCount} {run.gamesCount === 1 ? "game" : "games"} recorded
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <CalendarIcon className="size-3" />
                    <span>Created {dateStr}</span>
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
