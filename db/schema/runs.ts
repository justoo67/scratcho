import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const runs = pgTable("runs", {
  id: varchar("id", { length: 26 }).primaryKey(), // ULID
  name: text("name").notNull(),
  location: text("location"),
  ownerPlayerId: varchar("owner_player_id", { length: 26 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Run = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;

// Junction: which players are regular participants in a run
export const runPlayers = pgTable("run_players", {
  runId: varchar("run_id", { length: 26 }).notNull(),
  playerId: varchar("player_id", { length: 26 }).notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export type RunPlayer = typeof runPlayers.$inferSelect;
