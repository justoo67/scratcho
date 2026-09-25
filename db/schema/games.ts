import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum("game_status", [
  "setup",
  "active",
  "finished",
]);

export const games = pgTable("games", {
  id: varchar("id", { length: 26 }).primaryKey(), // ULID
  runId: varchar("run_id", { length: 26 }), // null = standalone game
  ownerPlayerId: varchar("owner_player_id", { length: 26 }).notNull(),
  status: gameStatusEnum("status").notNull().default("setup"),
  // Scorer session tracking — heartbeat-based
  activeScorerPlayerId: varchar("active_scorer_player_id", { length: 26 }),
  scorerSessionId: varchar("scorer_session_id", { length: 26 }),
  scorerLastSeenAt: timestamp("scorer_last_seen_at"),
  location: text("location"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameStatus = (typeof gameStatusEnum.enumValues)[number];

// Which players are in this game and on which team
export const gamePlayers = pgTable("game_players", {
  gameId: varchar("game_id", { length: 26 }).notNull(),
  playerId: varchar("player_id", { length: 26 }).notNull(),
  teamId: varchar("team_id", { length: 26 }).notNull(),
});

export type GamePlayer = typeof gamePlayers.$inferSelect;
