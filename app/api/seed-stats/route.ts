import { NextResponse } from "next/server"
import { db } from "@/db"
import { statDefinitions } from "@/db/schema"
import { ulid } from "@/lib/ulid"

// GET /api/seed-stats — idempotent, safe to call multiple times
export async function GET() {
  const defaults = [
    { code: "PTS", name: "Points", category: "scoring" as const, defaultValue: 2, sortOrder: 0 },
    { code: "REB", name: "Rebounds", category: "rebounding" as const, defaultValue: 1, sortOrder: 1 },
    { code: "AST", name: "Assists", category: "playmaking" as const, defaultValue: 1, sortOrder: 2 },
    { code: "STL", name: "Steals", category: "defense" as const, defaultValue: 1, sortOrder: 3 },
    { code: "BLK", name: "Blocks", category: "defense" as const, defaultValue: 1, sortOrder: 4 },
    { code: "TO", name: "Turnovers", category: "possession" as const, defaultValue: 1, sortOrder: 5 },
    { code: "FOU", name: "Fouls", category: "discipline" as const, defaultValue: 1, sortOrder: 6 },
  ]

  const rows = defaults.map((d) => ({ id: ulid(), ...d }))

  await db
    .insert(statDefinitions)
    .values(rows)
    .onConflictDoNothing() // safe to re-run; conflict on code unique index

  return NextResponse.json({ seeded: rows.length })
}
