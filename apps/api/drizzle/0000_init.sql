CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"theme" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"read_minutes" integer NOT NULL,
	"published_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purpose" text NOT NULL,
	"granted" boolean NOT NULL,
	"notice_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"city" text,
	"country" text NOT NULL,
	"scope" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"deadline" date,
	"best_for" text,
	"notes" text,
	"source_url" text,
	"source_name" text,
	"last_checked" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_items" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"date" date NOT NULL,
	"headline" text NOT NULL,
	"country" text NOT NULL,
	"level" text NOT NULL,
	"instrument" text NOT NULL,
	"stage" text NOT NULL,
	"impact" text NOT NULL,
	"amount" text,
	"takeaway" text NOT NULL,
	"source_url" text NOT NULL,
	"source_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policy_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "schemes" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"level" text NOT NULL,
	"state" text,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"benefits" text[] DEFAULT '{}' NOT NULL,
	"how_to_apply" text[] DEFAULT '{}' NOT NULL,
	"rule" jsonb NOT NULL,
	"also_check" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"status_note" text,
	"source_url" text NOT NULL,
	"source_name" text NOT NULL,
	"last_verified_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schemes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "startups" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"one_liner" text,
	"description" text,
	"website" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"entity_type" text,
	"incorporation_date" date,
	"turnover_inr_cr" double precision,
	"dpiit_recognised" boolean,
	"state" text,
	"sectors" text[] DEFAULT '{}' NOT NULL,
	"stage" text,
	"is_deep_tech" boolean,
	"women_led" boolean,
	"govt_support_received_inr_lakh" double precision,
	"indian_promoter_share_pct" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "startups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startups" ADD CONSTRAINT "startups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consents_user_purpose_idx" ON "consents" USING btree ("user_id","purpose","created_at");--> statement-breakpoint
CREATE INDEX "events_start_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "otp_codes_email_idx" ON "otp_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "policy_date_idx" ON "policy_items" USING btree ("date");--> statement-breakpoint
CREATE INDEX "startups_owner_idx" ON "startups" USING btree ("owner_id");