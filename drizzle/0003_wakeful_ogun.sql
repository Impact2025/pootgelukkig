CREATE TYPE "public"."user_rol" AS ENUM('adoptant', 'asiel', 'admin');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "rol" "user_rol" DEFAULT 'adoptant' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "asiel_id" integer;