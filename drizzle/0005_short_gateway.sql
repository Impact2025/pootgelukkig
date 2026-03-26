CREATE TYPE "public"."afspraak_status" AS ENUM('aangevraagd', 'bevestigd', 'afgerond', 'geannuleerd');--> statement-breakpoint
CREATE TYPE "public"."afspraak_type" AS ENUM('kennismaking', 'thuischeck');--> statement-breakpoint
CREATE TABLE "afspraken" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dier_id" integer NOT NULL,
	"asiel_id" integer NOT NULL,
	"type" "afspraak_type" DEFAULT 'kennismaking' NOT NULL,
	"status" "afspraak_status" DEFAULT 'aangevraagd' NOT NULL,
	"voorkeur_datum" timestamp NOT NULL,
	"voorkeur_tijdslot" varchar(20) NOT NULL,
	"bevestigde_datum" timestamp,
	"bevestigd_tijdstip" varchar(10),
	"notitie_adoptant" text,
	"notitie_asiel" text,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN "openingstijden" json;--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN "social_media" json;--> statement-breakpoint
ALTER TABLE "asielen" ADD COLUMN "asiel_config" json;--> statement-breakpoint
ALTER TABLE "afspraken" ADD CONSTRAINT "afspraken_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "afspraken" ADD CONSTRAINT "afspraken_dier_id_dieren_id_fk" FOREIGN KEY ("dier_id") REFERENCES "public"."dieren"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "afspraken" ADD CONSTRAINT "afspraken_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE no action ON UPDATE no action;