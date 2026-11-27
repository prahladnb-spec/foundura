CREATE TABLE "stories" (
	"id" text PRIMARY KEY NOT NULL,
	"startup_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"founder_name" text NOT NULL,
	"founder_role" text,
	"lang" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"editor_note" text,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stories_startup_id_unique" UNIQUE("startup_id"),
	CONSTRAINT "stories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "story_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"confirmations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"text_hash" text NOT NULL,
	"statement_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_consents" ADD CONSTRAINT "story_consents_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_consents" ADD CONSTRAINT "story_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stories_status_idx" ON "stories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "story_consents_story_idx" ON "story_consents" USING btree ("story_id","created_at");