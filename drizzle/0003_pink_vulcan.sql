CREATE TABLE IF NOT EXISTS "trade" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"position_id" text NOT NULL,
	"symbol" text NOT NULL,
	"position_side" text NOT NULL,
	"isolated" boolean NOT NULL,
	"open_time" timestamp with time zone NOT NULL,
	"update_time" timestamp with time zone NOT NULL,
	"avg_price" text NOT NULL,
	"avg_close_price" text,
	"realised_profit" text NOT NULL,
	"net_profit" text NOT NULL,
	"position_amt" text NOT NULL,
	"close_position_amt" text,
	"leverage" double precision NOT NULL,
	"close_all_positions" boolean DEFAULT false NOT NULL,
	"position_commission" text,
	"total_funding" text,
	"type" text NOT NULL,
	"coin" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_account_id_exchange_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."exchange_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "trade_account_position_idx" ON "trade" USING btree ("account_id","position_id");--> statement-breakpoint
CREATE INDEX "trade_account_id_idx" ON "trade" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "trade_account_update_time_coin_idx" ON "trade" USING btree ("account_id","update_time" DESC NULLS LAST,"coin");--> statement-breakpoint
CREATE INDEX "trade_account_symbol_coin_idx" ON "trade" USING btree ("account_id","symbol","coin");
