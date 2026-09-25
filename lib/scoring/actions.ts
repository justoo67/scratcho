"use server";

import { db } from "@/db";
import { statEvents } from "@/db/schema";
import {
  recordStatEventSchema,
  type RecordStatEventInput,
} from "@/lib/validation";
import { eq, and, sum } from "drizzle-orm";

/**
 * Records a stat event. The `id` field from the client is the idempotency key —
 * if the same id arrives twice (network retry), onConflictDoNothing prevents doubles.
 */
export async function recordStatEvent(input: RecordStatEventInput) {
  const parsed = recordStatEventSchema.parse(input);

  const [event] = await db
    .insert(statEvents)
    .values({ ...parsed, recordedAt: new Date() })
    .onConflictDoNothing()
    .returning();

  return event ?? null; // null means it was a duplicate — safe to ignore
}

/**
 * Void a stat event (undo). Preserves the record for audit purposes.
 */
export async function voidStatEvent(eventId: string, reason?: string) {
  await db
    .update(statEvents)
    .set({ voided: true, voidedReason: reason ?? "undo" })
    .where(eq(statEvents.id, eventId));
}

/**
 * Aggregate totals for all non-voided events in a game.
 * Returns { playerId, statId, total }[]
 */
export async function getGameTotals(gameId: string) {
  return db
    .select({
      playerId: statEvents.playerId,
      statId: statEvents.statId,
      total: sum(statEvents.value).mapWith(Number),
    })
    .from(statEvents)
    .where(
      and(eq(statEvents.gameId, gameId), eq(statEvents.voided, false))
    )
    .groupBy(statEvents.playerId, statEvents.statId);
}
