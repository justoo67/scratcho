import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { teams } from "@/db/schema"
import { ulid } from "@/lib/ulid"
import { z } from "zod"

const schema = z.object({
  gameId: z.string(),
  name: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId, name } = schema.parse(body)
    const id = ulid()
    const [team] = await db.insert(teams).values({ id, gameId, name }).returning()
    return NextResponse.json(team)
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
