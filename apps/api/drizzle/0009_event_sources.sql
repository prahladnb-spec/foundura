CREATE TABLE "event_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"kind" text NOT NULL,
	"scope" text NOT NULL,
	"default_type" text DEFAULT 'Conference' NOT NULL,
	"trusted" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp with time zone,
	"last_result" text,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_sources_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "format" text DEFAULT 'In person' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "source_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_source_id_event_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."event_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_source_external_idx" ON "events" USING btree ("source_id","external_id");