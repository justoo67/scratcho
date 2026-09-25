import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Events are immutable — stats are never overwritten, only appended
// Idempotency key prevents duplicate submissions on network retry
export const statEvents = pgTable("stat_events", {
  id: varchar("id", { length: 26 }).primaryKey(), // ULID — also serves as idempotency key
  gameId: varchar("game_id", { length: 26 }).notNull(),
  playerId: varchar("player_id", { length: 26 }).notNull(),
  statId: varchar("stat_id", { length: 26 }).notNull(),
  value: integer("value").notNull(), // can be negative for undo
  scorerPlayerId: varchar("scorer_player_id", { length: 26 }),
  scorerSessionId: varchar("scorer_session_id", { length: 26 }),
  // Soft-deleted when corrected rather than hard-deleted (audit trail)
  voided: boolean("voided").notNull().default(false),
  voidedReason: text("voided_reason"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export type StatEvent = typeof statEvents.$inferSelect;
export type NewStatEvent = typeof statEvents.$inferInsert;

// Audit trail for owner corrections to completed games
export const gameCorrections = pgTable("game_corrections", {
  id: varchar("id", { length: 26 }).primaryKey(),
  gameId: varchar("game_id", { length: 26 }).notNull(),
  originalEventId: varchar("original_event_id", { length: 26 }),
  newEventId: varchar("new_event_id", { length: 26 }),
  reason: text("reason"),
  actorPlayerId: varchar("actor_player_id", { length: 26 }).notNull(),
  correctedAt: timestamp("corrected_at").notNull().defaultNow(),
});

export type GameCorrection = typeof gameCorrections.$inferSelect;
