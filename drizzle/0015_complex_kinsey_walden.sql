CREATE TYPE "public"."onboarding_afzender" AS ENUM('gebruiker', 'assistent');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status" AS ENUM('niet_gestart', 'bezig', 'afgerond', 'overgeslagen');--> statement-breakpoint
CREATE TYPE "public"."team_uitnodiging_status" AS ENUM('open', 'geaccepteerd', 'ingetrokken');--> statement-breakpoint
CREATE TABLE "onboarding_berichten" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisatie_id" text NOT NULL,
	"afzender" "onboarding_afzender" NOT NULL,
	"inhoud" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_uitnodigingen" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisatie_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"uitgenodigd_door" integer,
	"status" "team_uitnodiging_status" DEFAULT 'open' NOT NULL,
	"verloopt_op" timestamp NOT NULL,
	"geaccepteerd_op" timestamp,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "rechtsvorm" varchar(120);--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "werkveld_categorieen" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "gemeenten" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "teamgrootte" integer;--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "vrijwilligers_aantal" integer;--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "grootste_knelpunt" text;--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "tone_of_voice" varchar(60);--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "onboarding_status" "onboarding_status" DEFAULT 'niet_gestart' NOT NULL;--> statement-breakpoint
ALTER TABLE "organisaties" ADD COLUMN "onboarding_afgerond_op" timestamp;--> statement-breakpoint
ALTER TABLE "onboarding_berichten" ADD CONSTRAINT "onboarding_berichten_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_uitnodigingen" ADD CONSTRAINT "team_uitnodigingen_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_uitnodigingen" ADD CONSTRAINT "team_uitnodigingen_uitgenodigd_door_users_id_fk" FOREIGN KEY ("uitgenodigd_door") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "onboarding_berichten_organisatie_id_idx" ON "onboarding_berichten" USING btree ("organisatie_id");--> statement-breakpoint
CREATE INDEX "team_uitnodigingen_organisatie_id_idx" ON "team_uitnodigingen" USING btree ("organisatie_id");