import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: varchar("id", { length: 26 }).primaryKey(), // ULID
  gameId: varchar("game_id", { length: 26 }).notNull(),
  name: text("name").notNull(), // "Team A", "Shirts", etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
