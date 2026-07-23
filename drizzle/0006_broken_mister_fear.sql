CREATE TABLE "ai_summary_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_id" text NOT NULL,
	"week_start" timestamp with time zone NOT NULL,
	"week_end" timestamp with time zone NOT NULL,
	"version" text NOT NULL,
	"analysis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_summary_analysis" ADD CONSTRAINT "ai_summary_analysis_subscription_id_ai_summary_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."ai_summary_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_summary_analysis_subscription_week_idx" ON "ai_summary_analysis" USING btree ("subscription_id","week_start");--> statement-breakpoint
CREATE INDEX "ai_summary_analysis_subscription_id_idx" ON "ai_summary_analysis" USING btree ("subscription_id");