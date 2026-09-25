import { z } from "zod";

export const ulidSchema = z.string().length(26);

// ---------- Player ----------

export const createPlayerSchema = z.object({
  name: z.string().min(1).max(80),
  nickname: z.string().max(40).optional(),
  jerseyNumber: z.string().max(4).optional(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;

// ---------- Run ----------

export const createRunSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  ownerPlayerId: ulidSchema,
});

export type CreateRunInput = z.infer<typeof createRunSchema>;

// ---------- Game ----------

export const createGameSchema = z.object({
  runId: ulidSchema.optional(),
  ownerPlayerId: ulidSchema,
  location: z.string().max(200).optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;

// ---------- Team ----------

export const createTeamSchema = z.object({
  gameId: ulidSchema,
  name: z.string().min(1).max(40),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// ---------- Stat Event ----------

export const recordStatEventSchema = z.object({
  // Client generates the ULID — this is also the idempotency key
  id: ulidSchema,
  gameId: ulidSchema,
  playerId: ulidSchema,
  statId: ulidSchema,
  value: z.number().int().min(-100).max(100),
  scorerPlayerId: ulidSchema.optional(),
  scorerSessionId: ulidSchema.optional(),
});

export type RecordStatEventInput = z.infer<typeof recordStatEventSchema>;
