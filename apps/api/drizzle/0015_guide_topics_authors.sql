ALTER TABLE "articles" ADD COLUMN "topic" text DEFAULT 'start' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author_role" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author_url" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author_consent_at" timestamp with time zone;