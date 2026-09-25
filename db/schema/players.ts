import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: varchar("id", { length: 26 }).primaryKey(), // ULID
  name: text("name").notNull(),
  nickname: text("nickname"),
  jerseyNumber: varchar("jersey_number", { length: 4 }),
  photoUrl: text("photo_url"),
  // Set when a real user claims this player identity
  claimedByUserId: text("claimed_by_user_id"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
