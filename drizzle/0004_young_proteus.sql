CREATE TABLE "notebook_template" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_plain_text" text DEFAULT '' NOT NULL,
	"last_time_used" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notebook" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"content_plain_text" text,
	"trade_id" text,
	"account_id" text NOT NULL,
	"coin" text NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notebook_template" ADD CONSTRAINT "notebook_template_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebook" ADD CONSTRAINT "notebook_trade_id_trade_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trade"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebook" ADD CONSTRAINT "notebook_account_id_exchange_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."exchange_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notebook_template_user_id_idx" ON "notebook_template" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notebook_account_id_idx" ON "notebook" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notebook_trade_id_unique_idx" ON "notebook" USING btree ("trade_id");