CREATE TABLE "profile_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"startup_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"show_readiness" boolean DEFAULT false NOT NULL,
	"show_progress" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "profile_shares_startup_id_unique" UNIQUE("startup_id"),
	CONSTRAINT "profile_shares_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "journey_stage" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "journey_done" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_shares" ADD CONSTRAINT "profile_shares_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;