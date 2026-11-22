CREATE TABLE "intro_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"startup_id" text NOT NULL,
	"investor_id" text NOT NULL,
	"message" text NOT NULL,
	"match_score" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"firm" text,
	"type" text NOT NULL,
	"bio" text,
	"website" text,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"stages" text[] DEFAULT '{}' NOT NULL,
	"states" text[] DEFAULT '{}' NOT NULL,
	"cheque_min_inr_lakh" double precision NOT NULL,
	"cheque_max_inr_lakh" double precision NOT NULL,
	"is_listed" boolean DEFAULT true NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "investors_owner_id_unique" UNIQUE("owner_id"),
	CONSTRAINT "investors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "deck_url" text;--> statement-breakpoint
ALTER TABLE "startups" ADD COLUMN "raising_inr_lakh" double precision;--> statement-breakpoint
ALTER TABLE "intro_requests" ADD CONSTRAINT "intro_requests_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intro_requests" ADD CONSTRAINT "intro_requests_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investors" ADD CONSTRAINT "investors_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "intros_startup_idx" ON "intro_requests" USING btree ("startup_id","status");--> statement-breakpoint
CREATE INDEX "intros_investor_idx" ON "intro_requests" USING btree ("investor_id","status");--> statement-breakpoint
CREATE INDEX "investors_listed_idx" ON "investors" USING btree ("is_listed");