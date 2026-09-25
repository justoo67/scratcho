"use server";

import { db } from "@/db";
import { runs, runPlayers } from "@/db/schema";
import { ulid } from "@/lib/ulid";
import { createRunSchema, type CreateRunInput } from "@/lib/validation";

export async function createRun(input: CreateRunInput) {
  const parsed = createRunSchema.parse(input);
  const id = ulid();

  const [run] = await db
    .insert(runs)
    .values({ id, ...parsed })
    .returning();

  // Owner is always a participant
  await db
    .insert(runPlayers)
    .values({ runId: id, playerId: parsed.ownerPlayerId });

  return run;
}

export async function getRun(id: string) {
  return db.query.runs.findFirst({
    where: (r, { eq }) => eq(r.id, id),
  });
}

export async function addPlayerToRun(runId: string, playerId: string) {
  await db
    .insert(runPlayers)
    .values({ runId, playerId })
    .onConflictDoNothing();
}
