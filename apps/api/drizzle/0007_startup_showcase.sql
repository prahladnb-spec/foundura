ALTER TABLE "startups" ADD COLUMN "product_url" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "looking_for" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "showcase_hidden_at" timestamp with time zone;