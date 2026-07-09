CREATE TYPE "public"."ai_rol" AS ENUM('social', 'fundraising', 'vrijwilligers', 'evenementen', 'medisch', 'foto', 'rapportage', 'chat');--> statement-breakpoint
CREATE TYPE "public"."campagne_status" AS ENUM('concept', 'actief', 'afgerond', 'gepauzeerd');--> statement-breakpoint
CREATE TYPE "public"."campagne_type" AS ENUM('donatie', 'grant', 'sponsor', 'evenement');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('concept', 'voorgesteld', 'gepland', 'gepubliceerd', 'afgewezen');--> statement-breakpoint
CREATE TYPE "public"."donor_segment" AS ENUM('nieuw', 'regulier', 'major', 'laps', 'actief');--> statement-breakpoint
CREATE TYPE "public"."donor_type" AS ENUM('eenmalig', 'structureel', 'bedrijf');--> statement-breakpoint
CREATE TYPE "public"."evenement_status" AS ENUM('concept', 'gepland', 'afgerond', 'geannuleerd');--> statement-breakpoint
CREATE TYPE "public"."evenement_type" AS ENUM('adoptiedag', 'opendag', 'fundraising', 'andere');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('open', 'ingevuld', 'geannuleerd');--> statement-breakpoint
CREATE TYPE "public"."sollicitatie_status" AS ENUM('nieuw', 'gescreend', 'uitgenodigd', 'afgewezen');--> statement-breakpoint
CREATE TYPE "public"."vrijwilliger_status" AS ENUM('kandidaat', 'actief', 'inactief');--> statement-breakpoint
CREATE TABLE "ai_content_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"rol" "ai_rol" NOT NULL,
	"type" varchar(40) NOT NULL,
	"platform" varchar(40),
	"titel" varchar(255),
	"inhoud" text NOT NULL,
	"status" "content_status" DEFAULT 'concept' NOT NULL,
	"gepland_voor" timestamp,
	"gepubliceerd_op" timestamp,
	"engagement" json DEFAULT '{}'::json,
	"gemaakt_door" varchar(60) DEFAULT 'ai',
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_rollen_config" (
	"asiel_id" integer NOT NULL,
	"rol" "ai_rol" NOT NULL,
	"actief" boolean DEFAULT true NOT NULL,
	"instellingen" json DEFAULT '{}'::json,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_rollen_config_asiel_id_rol_pk" PRIMARY KEY("asiel_id","rol")
);
--> statement-breakpoint
CREATE TABLE "donoren" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"naam" varchar(255) NOT NULL,
	"email" varchar(255),
	"telefoon" varchar(30),
	"bedrijf" varchar(255),
	"type" "donor_type" DEFAULT 'eenmalig' NOT NULL,
	"segment" "donor_segment" DEFAULT 'nieuw' NOT NULL,
	"totaal_gedoneerd" real DEFAULT 0 NOT NULL,
	"eerste_donatie_op" timestamp,
	"laatste_donatie_op" timestamp,
	"tags" json DEFAULT '[]'::json,
	"notities" text,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evenement_shiften" (
	"id" serial PRIMARY KEY NOT NULL,
	"evenement_id" integer NOT NULL,
	"taak" varchar(160) NOT NULL,
	"start_op" timestamp NOT NULL,
	"eind_op" timestamp,
	"vrijwilliger_id" integer,
	"shift_status" "shift_status" DEFAULT 'open' NOT NULL,
	"notities" text
);
--> statement-breakpoint
CREATE TABLE "evenementen" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"titel" varchar(255) NOT NULL,
	"type" "evenement_type" DEFAULT 'adoptiedag' NOT NULL,
	"beschrijving" text,
	"locatie" varchar(255),
	"start_op" timestamp NOT NULL,
	"eind_op" timestamp,
	"capaciteit" integer,
	"status" "evenement_status" DEFAULT 'concept' NOT NULL,
	"promo_concept_id" integer,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fondsenwerving_campagnes" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"naam" varchar(255) NOT NULL,
	"type" "campagne_type" DEFAULT 'donatie' NOT NULL,
	"status" "campagne_status" DEFAULT 'concept' NOT NULL,
	"doel_bedrag" real DEFAULT 0,
	"opgehaald_bedrag" real DEFAULT 0 NOT NULL,
	"start_op" timestamp,
	"eind_op" timestamp,
	"notities" text,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sollicitaties" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"naam" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"telefoon" varchar(30),
	"functie" varchar(120),
	"motivatie" text,
	"ervaring" text,
	"status" "sollicitatie_status" DEFAULT 'nieuw' NOT NULL,
	"ai_score" integer,
	"ai_screen_notitie" text,
	"vrijwilliger_id" integer,
	"aangemeld_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vrijwilligers" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"naam" varchar(255) NOT NULL,
	"email" varchar(255),
	"telefoon" varchar(30),
	"functie" varchar(120) DEFAULT 'algemene ondersteuning',
	"status" "vrijwilliger_status" DEFAULT 'kandidaat' NOT NULL,
	"uren_per_week" integer DEFAULT 0,
	"beschikbaarheid" json DEFAULT '{}'::json,
	"tags" json DEFAULT '[]'::json,
	"notities" text,
	"aangemeld_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD CONSTRAINT "ai_content_queue_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_rollen_config" ADD CONSTRAINT "ai_rollen_config_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donoren" ADD CONSTRAINT "donoren_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenement_shiften" ADD CONSTRAINT "evenement_shiften_evenement_id_evenementen_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenementen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenement_shiften" ADD CONSTRAINT "evenement_shiften_vrijwilliger_id_vrijwilligers_id_fk" FOREIGN KEY ("vrijwilliger_id") REFERENCES "public"."vrijwilligers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenementen" ADD CONSTRAINT "evenementen_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fondsenwerving_campagnes" ADD CONSTRAINT "fondsenwerving_campagnes_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sollicitaties" ADD CONSTRAINT "sollicitaties_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sollicitaties" ADD CONSTRAINT "sollicitaties_vrijwilliger_id_vrijwilligers_id_fk" FOREIGN KEY ("vrijwilliger_id") REFERENCES "public"."vrijwilligers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrijwilligers" ADD CONSTRAINT "vrijwilligers_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE cascade ON UPDATE no action;