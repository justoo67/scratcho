"use server";

import { db } from "@/db";
import { games, gamePlayers, teams } from "@/db/schema";
import { ulid } from "@/lib/ulid";
import { createGameSchema, type CreateGameInput } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function createGame(input: CreateGameInput) {
  const parsed = createGameSchema.parse(input);
  const id = ulid();

  const [game] = await db
    .insert(games)
    .values({ id, ...parsed, status: "setup" })
    .returning();

  return game;
}

export async function startGame(gameId: string) {
  const [game] = await db
    .update(games)
    .set({ status: "active", startedAt: new Date() })
    .where(eq(games.id, gameId))
    .returning();
  return game;
}

export async function finishGame(gameId: string) {
  const [game] = await db
    .update(games)
    .set({ status: "finished", finishedAt: new Date() })
    .where(eq(games.id, gameId))
    .returning();
  return game;
}

export async function transferScorer(
  gameId: string,
  newScorerPlayerId: string
) {
  const sessionId = ulid();
  const [game] = await db
    .update(games)
    .set({
      activeScorerPlayerId: newScorerPlayerId,
      scorerSessionId: sessionId,
      scorerLastSeenAt: new Date(),
    })
    .where(eq(games.id, gameId))
    .returning();
  return game;
}

export async function pingScorerHeartbeat(gameId: string) {
  await db
    .update(games)
    .set({ scorerLastSeenAt: new Date() })
    .where(eq(games.id, gameId));
}

export async function getGame(id: string) {
  return db.query.games.findFirst({
    where: (g, { eq }) => eq(g.id, id),
  });
}
