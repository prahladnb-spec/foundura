CREATE TABLE "daily_counts" (
	"day" date NOT NULL,
	"metric" text NOT NULL,
	"key" text DEFAULT '' NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "daily_counts_day_metric_key_pk" PRIMARY KEY("day","metric","key")
);
