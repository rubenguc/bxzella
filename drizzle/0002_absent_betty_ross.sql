ALTER TABLE "exchange_account" ADD COLUMN "api_key_hash" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "exchange_account" ALTER COLUMN "api_key_hash" DROP DEFAULT;
