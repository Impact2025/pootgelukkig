ALTER TABLE "asielen" ADD COLUMN IF NOT EXISTS "postcode" varchar(10);--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN IF NOT EXISTS "lat" real;--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN IF NOT EXISTS "lng" real;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "postcode" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lat" real;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lng" real;
