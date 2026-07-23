CREATE TABLE "ai_summary_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"coin" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"include_notebook" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_summary_subscription" ADD CONSTRAINT "ai_summary_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summary_subscription" ADD CONSTRAINT "ai_summary_subscription_account_id_exchange_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."exchange_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_summary_subscription_account_coin_idx" ON "ai_summary_subscription" USING btree ("account_id","coin");--> statement-breakpoint
CREATE INDEX "ai_summary_subscription_user_id_idx" ON "ai_summary_subscription" USING btree ("user_id");