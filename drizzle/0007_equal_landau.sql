CREATE TABLE "strategy" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_group_id" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_rule_group" (
	"id" text PRIMARY KEY NOT NULL,
	"strategy_id" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_rule_check" (
	"id" text PRIMARY KEY NOT NULL,
	"trade_id" text NOT NULL,
	"rule_id" text NOT NULL,
	"followed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trade" ADD COLUMN "strategy_id" text;--> statement-breakpoint
ALTER TABLE "strategy" ADD CONSTRAINT "strategy_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_rule" ADD CONSTRAINT "strategy_rule_rule_group_id_strategy_rule_group_id_fk" FOREIGN KEY ("rule_group_id") REFERENCES "public"."strategy_rule_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_rule_group" ADD CONSTRAINT "strategy_rule_group_strategy_id_strategy_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategy"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_rule_check" ADD CONSTRAINT "trade_rule_check_trade_id_trade_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_rule_check" ADD CONSTRAINT "trade_rule_check_rule_id_strategy_rule_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."strategy_rule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategy_user_id_idx" ON "strategy" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "strategy_rule_rule_group_id_idx" ON "strategy_rule" USING btree ("rule_group_id");--> statement-breakpoint
CREATE INDEX "strategy_rule_group_strategy_id_idx" ON "strategy_rule_group" USING btree ("strategy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trade_rule_check_trade_rule_idx" ON "trade_rule_check" USING btree ("trade_id","rule_id");--> statement-breakpoint
CREATE INDEX "trade_rule_check_rule_id_idx" ON "trade_rule_check" USING btree ("rule_id");--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_strategy_id_strategy_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategy"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trade_strategy_stats_idx" ON "trade" USING btree ("strategy_id","account_id","coin","close_all_positions");--> statement-breakpoint
CREATE INDEX "trade_strategy_update_idx" ON "trade" USING btree ("strategy_id","account_id","coin","update_time" DESC NULLS LAST);