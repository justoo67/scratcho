import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { recordStatEvent, voidStatEvent } from "@/lib/scoring/actions"

const recordSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  playerId: z.string(),
  statId: z.string(),
  value: z.number().int(),
  scorerPlayerId: z.string().optional(),
  scorerSessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = recordSchema.parse(body)
    const event = await recordStatEvent(data)
    return NextResponse.json({ ok: true, event })
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

const voidSchema = z.object({
  eventId: z.string(),
  reason: z.string().optional(),
})

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, reason } = voidSchema.parse(body)
    await voidStatEvent(eventId, reason)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
