ALTER TABLE "articles" ADD COLUMN "focus_keyphrase" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "seo_title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "meta_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "keywords" jsonb DEFAULT '[]'::jsonb NOT NULL;