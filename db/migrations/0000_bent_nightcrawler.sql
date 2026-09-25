CREATE TYPE "public"."game_status" AS ENUM('setup', 'active', 'finished');--> statement-breakpoint
CREATE TYPE "public"."stat_category" AS ENUM('scoring', 'rebounding', 'playmaking', 'defense', 'possession', 'discipline');--> statement-breakpoint
CREATE TABLE "players" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nickname" text,
	"jersey_number" varchar(4),
	"photo_url" text,
	"claimed_by_user_id" text,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_players" (
	"run_id" varchar(26) NOT NULL,
	"player_id" varchar(26) NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"owner_player_id" varchar(26) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_players" (
	"game_id" varchar(26) NOT NULL,
	"player_id" varchar(26) NOT NULL,
	"team_id" varchar(26) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"run_id" varchar(26),
	"owner_player_id" varchar(26) NOT NULL,
	"status" "game_status" DEFAULT 'setup' NOT NULL,
	"active_scorer_player_id" varchar(26),
	"scorer_session_id" varchar(26),
	"scorer_last_seen_at" timestamp,
	"location" text,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"game_id" varchar(26) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_stat_config" (
	"run_id" varchar(26) NOT NULL,
	"stat_id" varchar(26) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stat_definitions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"code" varchar(16) NOT NULL,
	"name" text NOT NULL,
	"category" "stat_category" NOT NULL,
	"default_value" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "stat_definitions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "game_corrections" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"game_id" varchar(26) NOT NULL,
	"original_event_id" varchar(26),
	"new_event_id" varchar(26),
	"reason" text,
	"actor_player_id" varchar(26) NOT NULL,
	"corrected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stat_events" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"game_id" varchar(26) NOT NULL,
	"player_id" varchar(26) NOT NULL,
	"stat_id" varchar(26) NOT NULL,
	"value" integer NOT NULL,
	"scorer_player_id" varchar(26),
	"scorer_session_id" varchar(26),
	"voided" boolean DEFAULT false NOT NULL,
	"voided_reason" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");