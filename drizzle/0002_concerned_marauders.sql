ALTER TABLE "adopter_profielen" ADD COLUMN "profiel_hash" varchar(24);--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "uitkomst" varchar(50);--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "uitkomst_op" timestamp;