"use server";

import { eq } from "drizzle-orm";
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
    .values({ id, ...parsed })
    .returning();

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

export async function getPlayerStats(playerId: string) {
  const { gamePlayers, statEvents, statDefinitions } = await import("@/db/schema");
  const { and, countDistinct, sum } = await import("drizzle-orm");

  const [gamesCount] = await db
    .select({ count: countDistinct(gamePlayers.gameId) })
    .from(gamePlayers)
    .where(eq(gamePlayers.playerId, playerId));

  const totalGames = Number(gamesCount?.count || 0);

  const totals = await db
    .select({
      statId: statEvents.statId,
      total: sum(statEvents.value).mapWith(Number),
    })
    .from(statEvents)
    .where(
      and(eq(statEvents.playerId, playerId), eq(statEvents.voided, false))
    )
    .groupBy(statEvents.statId);

  const defs = await db.query.statDefinitions.findMany({
    orderBy: (d, { asc }) => [asc(d.sortOrder)],
  });

  const stats = defs.map((d) => {
    const statTotal = totals.find((t) => t.statId === d.id)?.total || 0;
    const perGame = totalGames > 0 ? (statTotal / totalGames).toFixed(1) : "0.0";
    return {
      id: d.id,
      code: d.code,
      name: d.name,
      total: statTotal,
      perGame,
      label:
        d.code === "PTS"
          ? "PPG"
          : d.code === "REB"
          ? "RPG"
          : d.code === "AST"
          ? "APG"
          : d.code === "STL"
          ? "SPG"
          : d.code === "BLK"
          ? "BPG"
          : `${d.code}/G`,
    };
  });

  return {
    totalGames,
    stats,
  };
}
