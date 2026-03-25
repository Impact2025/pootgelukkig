CREATE TYPE "public"."activiteit_niveau" AS ENUM('laag', 'normaal', 'hoog', 'zeer_hoog');--> statement-breakpoint
CREATE TYPE "public"."adoptie_status" AS ENUM('aangevraagd', 'goedgekeurd', 'afgerond', 'afgewezen', 'geannuleerd');--> statement-breakpoint
CREATE TYPE "public"."animal_species" AS ENUM('hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig');--> statement-breakpoint
CREATE TYPE "public"."animal_status" AS ENUM('beschikbaar', 'in_behandeling', 'geadopteerd', 'niet_beschikbaar');--> statement-breakpoint
CREATE TYPE "public"."bericht_verzender" AS ENUM('adoptant', 'asiel', 'systeem');--> statement-breakpoint
CREATE TYPE "public"."medisch_status" AS ENUM('aankomend', 'voltooid', 'gemist', 'geannuleerd');--> statement-breakpoint
CREATE TYPE "public"."woning_type" AS ENUM('appartement', 'huis_zonder_tuin', 'huis_met_tuin', 'boerderij');--> statement-breakpoint
CREATE TABLE "adopter_profielen" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"woning_type" "woning_type",
	"heeft_tuin" boolean DEFAULT false,
	"tuin_oppervlakte" varchar(50),
	"activiteit_niveau" "activiteit_niveau",
	"aantal_volwassenen" integer DEFAULT 1,
	"aantal_kinderen" integer DEFAULT 0,
	"jongste_kind_leeftijd" integer,
	"andere_dieren" json DEFAULT '[]'::json,
	"werk_uren_per_dag" integer DEFAULT 8,
	"ervaring_niveau" varchar(50),
	"budget_dierenarts" varchar(50),
	"allergieën" json DEFAULT '[]'::json,
	"diersoort_voorkeur" json DEFAULT '[]'::json,
	"leeftijd_voorkeur" varchar(50),
	"extra_wensen" text,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adopties" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dier_id" integer NOT NULL,
	"asiel_id" integer NOT NULL,
	"status" "adoptie_status" DEFAULT 'aangevraagd' NOT NULL,
	"adoptie_datum" timestamp,
	"overeenkomst_url" text,
	"ir_registratie_url" text,
	"verzekering_maatschappij" varchar(100),
	"verzekering_polisnummer" varchar(100),
	"aangevraagd_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asielen" (
	"id" serial PRIMARY KEY NOT NULL,
	"naam" varchar(255) NOT NULL,
	"stad" varchar(100) NOT NULL,
	"regio" varchar(100) NOT NULL,
	"adres" text,
	"telefoon" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"logo_url" text,
	"beschrijving" text,
	"actief" boolean DEFAULT true NOT NULL,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "berichten" (
	"id" serial PRIMARY KEY NOT NULL,
	"gesprek_id" integer NOT NULL,
	"verzender_type" "bericht_verzender" NOT NULL,
	"verzender_id" integer NOT NULL,
	"inhoud" text NOT NULL,
	"gelezen" boolean DEFAULT false,
	"verstuurd_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dieren" (
	"id" serial PRIMARY KEY NOT NULL,
	"asiel_id" integer NOT NULL,
	"naam" varchar(100) NOT NULL,
	"soort" "animal_species" NOT NULL,
	"ras" varchar(100),
	"leeftijd_jaren" integer,
	"leeftijd_maanden" integer,
	"geslacht" varchar(10),
	"gewicht_kg" real,
	"kleur" varchar(100),
	"verhaal" text,
	"status" "animal_status" DEFAULT 'beschikbaar' NOT NULL,
	"hoofd_foto_url" text,
	"foto_urls" json DEFAULT '[]'::json,
	"gedragsrofiel" json,
	"medisch_paspoort" json,
	"binnengekomen_op" timestamp DEFAULT now() NOT NULL,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gesprekken" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dier_id" integer NOT NULL,
	"asiel_id" integer NOT NULL,
	"afspraak_datum" timestamp,
	"afspraak_bevestigd" boolean DEFAULT false,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"laatste_bericht_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dier_id" integer NOT NULL,
	"score" integer NOT NULL,
	"analyse_tekst" text,
	"woning_score" integer,
	"energie_score" integer,
	"gezin_score" integer,
	"ervaring_score" integer,
	"is_aanbevolen" boolean DEFAULT false,
	"berekend_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medische_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"dier_id" integer NOT NULL,
	"type" varchar(100) NOT NULL,
	"titel" varchar(255) NOT NULL,
	"beschrijving" text,
	"datum" timestamp NOT NULL,
	"status" "medisch_status" DEFAULT 'voltooid' NOT NULL,
	"uitvoerder" varchar(100),
	"rapport_url" text,
	"notities" text,
	"volgende_datum" timestamp,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nazorg_dagen" (
	"id" serial PRIMARY KEY NOT NULL,
	"adoptie_id" integer NOT NULL,
	"dag_nummer" integer NOT NULL,
	"focus_onderwerp" varchar(100),
	"beschrijving" text,
	"tips" json DEFAULT '[]'::json,
	"checklist" json DEFAULT '[]'::json,
	"checklist_voltooid" boolean DEFAULT false,
	"aantekeningen_gebruiker" text,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"naam" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"wachtwoord_hash" text,
	"avatar_url" text,
	"stad" varchar(100),
	"profiel_voltooid" boolean DEFAULT false NOT NULL,
	"aangemeld_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "adopter_profielen" ADD CONSTRAINT "adopter_profielen_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adopties" ADD CONSTRAINT "adopties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adopties" ADD CONSTRAINT "adopties_dier_id_dieren_id_fk" FOREIGN KEY ("dier_id") REFERENCES "public"."dieren"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adopties" ADD CONSTRAINT "adopties_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "berichten" ADD CONSTRAINT "berichten_gesprek_id_gesprekken_id_fk" FOREIGN KEY ("gesprek_id") REFERENCES "public"."gesprekken"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dieren" ADD CONSTRAINT "dieren_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD CONSTRAINT "gesprekken_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD CONSTRAINT "gesprekken_dier_id_dieren_id_fk" FOREIGN KEY ("dier_id") REFERENCES "public"."dieren"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD CONSTRAINT "gesprekken_asiel_id_asielen_id_fk" FOREIGN KEY ("asiel_id") REFERENCES "public"."asielen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_dier_id_dieren_id_fk" FOREIGN KEY ("dier_id") REFERENCES "public"."dieren"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medische_records" ADD CONSTRAINT "medische_records_dier_id_dieren_id_fk" FOREIGN KEY ("dier_id") REFERENCES "public"."dieren"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nazorg_dagen" ADD CONSTRAINT "nazorg_dagen_adoptie_id_adopties_id_fk" FOREIGN KEY ("adoptie_id") REFERENCES "public"."adopties"("id") ON DELETE no action ON UPDATE no action;