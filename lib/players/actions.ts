"use server";

import { db } from "@/db";
import { players } from "@/db/schema";
import { ulid } from "@/lib/ulid";
import {
  createPlayerSchema,
  type CreatePlayerInput,
} from "@/lib/validation";

export async function createPlayer(input: CreatePlayerInput) {
  const parsed = createPlayerSchema.parse(input);
  const id = ulid();

  const [player] = await db
    .insert(players)
  return player;
}

export async function getPlayer(id: string) {
  return db.query.players.findFirst({
    where: (p, { eq }) => eq(p.id, id),
  });
}

export async function claimPlayer(playerId: string, userId: string) {
  const existing = await db.query.players.findFirst({
    where: (p, { eq }) => eq(p.id, playerId),
  });
  if (!existing) throw new Error("Player not found");
  if (existing.claimedByUserId) {
    if (existing.claimedByUserId === userId) return existing;
    throw new Error("This player profile has already been claimed.");
  }

  const [updated] = await db
    .update(players)
    .set({
      claimedByUserId: userId,
      claimedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId))
    .returning();

  return updated;
}

export async function updatePlayerProfile(
  playerId: string,
  userId: string,
  data: { nickname?: string; jerseyNumber?: string; photoUrl?: string }
) {
  const existing = await db.query.players.findFirst({
    where: (p, { eq }) => eq(p.id, playerId),
  });
  if (!existing || existing.claimedByUserId !== userId) {
    throw new Error("Unauthorized to edit this profile");
  }

  const [updated] = await db
    .update(players)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId))
    .returning();

  return updated;
}
