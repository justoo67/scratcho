import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const statCategoryEnum = pgEnum("stat_category", [
  "scoring",
  "rebounding",
  "playmaking",
  "defense",
  "possession",
  "discipline",
]);

// Catalog of supported stat types — not per-run, system-wide
export const statDefinitions = pgTable("stat_definitions", {
  id: varchar("id", { length: 26 }).primaryKey(), // ULID
  code: varchar("code", { length: 16 }).notNull().unique(), // e.g. "PTS", "REB"
  name: text("name").notNull(),
  category: statCategoryEnum("category").notNull(),
  defaultValue: integer("default_value").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type StatDefinition = typeof statDefinitions.$inferSelect;

// Which stats a run tracks (and in what order)
export const runStatConfig = pgTable("run_stat_config", {
  runId: varchar("run_id", { length: 26 }).notNull(),
  statId: varchar("stat_id", { length: 26 }).notNull(),
  enabled: boolean("enabled").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export type RunStatConfig = typeof runStatConfig.$inferSelect;
