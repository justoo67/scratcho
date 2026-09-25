import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { gamePlayers } from "@/db/schema"
import { z } from "zod"

const schema = z.object({
  gameId: z.string(),
  playerId: z.string(),
  teamId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    const [gp] = await db.insert(gamePlayers).values(data).returning()
    return NextResponse.json(gp)
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
