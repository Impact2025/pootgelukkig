CREATE TYPE "public"."werving_status" AS ENUM('nieuw', 'uitgenodigd', 'overgeslagen', 'aangesloten');--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN "bron" varchar(50) DEFAULT 'handmatig' NOT NULL;--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN "werving_status" "werving_status" DEFAULT 'aangesloten' NOT NULL;--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN "uitnodiging_verstuurd_op" timestamp;