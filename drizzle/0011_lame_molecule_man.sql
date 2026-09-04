CREATE TYPE "public"."ai_content_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."ai_content_type" AS ENUM('subsidie', 'rapportage', 'social_post', 'briefing', 'email');--> statement-breakpoint
CREATE TYPE "public"."begeleiding_status" AS ENUM('gepland', 'actief', 'afgerond', 'gestopt');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('aangemeld', 'gematcht', 'afgerond');--> statement-breakpoint
CREATE TYPE "public"."dossier_categorie" AS ENUM('wmo', 'participatie', 'jeugd', 'reintegratie', 'overig');--> statement-breakpoint
CREATE TYPE "public"."dossier_status" AS ENUM('intake', 'actief', 'in_behandeling', 'afgerond');--> statement-breakpoint
CREATE TYPE "public"."organisatie_status" AS ENUM('proef', 'actief', 'gearchiveerd');--> statement-breakpoint
CREATE TABLE "begeleidingen" (
	"id" text PRIMARY KEY NOT NULL,
	"dossier_id" text NOT NULL,
	"client_id" text NOT NULL,
	"organisatie_id" text NOT NULL,
	"start_datum" timestamp,
	"status" "begeleiding_status" DEFAULT 'gepland' NOT NULL,
	"evaluatie_notities" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clienten" (
	"id" text PRIMARY KEY NOT NULL,
	"organisatie_id" text NOT NULL,
	"voornaam" varchar(120) NOT NULL,
	"achternaam" varchar(120) NOT NULL,
	"email" varchar(255),
	"telefoon" varchar(30),
	"geboortedatum" timestamp,
	"hulpvraag_omschrijving" text,
	"profiel_data" jsonb DEFAULT '{}'::jsonb,
	"status" "client_status" DEFAULT 'aangemeld' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dossiers" (
	"id" text PRIMARY KEY NOT NULL,
	"organisatie_id" text NOT NULL,
	"dossier_nummer" varchar(60) NOT NULL,
	"titel" varchar(255) NOT NULL,
	"categorie" "dossier_categorie" DEFAULT 'overig' NOT NULL,
	"status" "dossier_status" DEFAULT 'intake' NOT NULL,
	"samenvatting" text,
	"intake_data" jsonb DEFAULT '{}'::jsonb,
	"vertrouwelijk" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organisaties" (
	"id" text PRIMARY KEY NOT NULL,
	"naam" varchar(255) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"kvk_nummer" varchar(20),
	"contact_email" varchar(255),
	"website" varchar(255),
	"telefoon" varchar(20),
	"status" "organisatie_status" DEFAULT 'proef' NOT NULL,
	"bron" varchar(50) DEFAULT 'handmatig' NOT NULL,
	"werving_status" "werving_status" DEFAULT 'aangesloten' NOT NULL,
	"uitnodiging_verstuurd_op" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organisaties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "adopties" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "asielen" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "dieren" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "adopties" CASCADE;--> statement-breakpoint
DROP TABLE "asielen" CASCADE;--> statement-breakpoint
DROP TABLE "dieren" CASCADE;--> statement-breakpoint
ALTER TABLE "afspraken" DROP CONSTRAINT IF EXISTS "afspraken_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "afspraken" DROP CONSTRAINT IF EXISTS "afspraken_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP CONSTRAINT IF EXISTS "ai_content_queue_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_rollen_config" DROP CONSTRAINT IF EXISTS "ai_rollen_config_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "donoren" DROP CONSTRAINT IF EXISTS "donoren_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "evenementen" DROP CONSTRAINT IF EXISTS "evenementen_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "favorieten" DROP CONSTRAINT IF EXISTS "favorieten_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "fondsenwerving_campagnes" DROP CONSTRAINT IF EXISTS "fondsenwerving_campagnes_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "gesprekken" DROP CONSTRAINT IF EXISTS "gesprekken_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "gesprekken" DROP CONSTRAINT IF EXISTS "gesprekken_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "medische_records" DROP CONSTRAINT IF EXISTS "medische_records_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "nazorg_dagen" DROP CONSTRAINT IF EXISTS "nazorg_dagen_adoptie_id_adopties_id_fk";
--> statement-breakpoint
ALTER TABLE "pleeggezinnen" DROP CONSTRAINT IF EXISTS "pleeggezinnen_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "pleegplaatsingen" DROP CONSTRAINT IF EXISTS "pleegplaatsingen_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "sollicitaties" DROP CONSTRAINT IF EXISTS "sollicitaties_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "vrijwilligers" DROP CONSTRAINT IF EXISTS "vrijwilligers_asiel_id_asielen_id_fk";
--> statement-breakpoint
ALTER TABLE "welzijn_logs" DROP CONSTRAINT IF EXISTS "welzijn_logs_dier_id_dieren_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_rollen_config" DROP CONSTRAINT IF EXISTS "ai_rollen_config_asiel_id_rol_pk";--> statement-breakpoint
ALTER TABLE "ai_content_queue" ALTER COLUMN "type" SET DATA TYPE ai_content_type USING "type"::text::ai_content_type;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ALTER COLUMN "status" SET DATA TYPE ai_content_status USING "status"::text::ai_content_status;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ai_gebruik" ALTER COLUMN "kosten_euro" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "ai_gebruik" ALTER COLUMN "kosten_euro" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "afspraken" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "afspraken" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD COLUMN "beoordeeld_op" timestamp;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD COLUMN "beoordeeld_door" varchar(120);--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD COLUMN "aangemaakt_op" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_gebruik" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_gebruik" ADD COLUMN "tokens_in" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_gebruik" ADD COLUMN "tokens_out" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_gebruik" ADD COLUMN "actie" varchar(80) NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_rollen_config" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_rollen_config" ADD COLUMN "system_prompt" text;--> statement-breakpoint
ALTER TABLE "ai_rollen_config" ADD CONSTRAINT "ai_rollen_config_organisatie_id_rol_pk" PRIMARY KEY("organisatie_id","rol");--> statement-breakpoint
ALTER TABLE "crm_contacten" ADD COLUMN "organisatie_id" text;--> statement-breakpoint
ALTER TABLE "donoren" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "evenementen" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "favorieten" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "fondsenwerving_campagnes" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "mail_log" ADD COLUMN "organisatie_id" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "medische_records" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "nazorg_dagen" ADD COLUMN "begeleiding_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pleeggezinnen" ADD COLUMN "organisatie_id" text;--> statement-breakpoint
ALTER TABLE "pleegplaatsingen" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sollicitaties" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "organisatie_id" text;--> statement-breakpoint
ALTER TABLE "vrijwilligers" ADD COLUMN "organisatie_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "welzijn_logs" ADD COLUMN "dossier_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "begeleidingen" ADD CONSTRAINT "begeleidingen_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "begeleidingen" ADD CONSTRAINT "begeleidingen_client_id_clienten_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clienten"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "begeleidingen" ADD CONSTRAINT "begeleidingen_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clienten" ADD CONSTRAINT "clienten_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "begeleidingen_organisatie_id_idx" ON "begeleidingen" USING btree ("organisatie_id");--> statement-breakpoint
CREATE INDEX "clienten_organisatie_id_idx" ON "clienten" USING btree ("organisatie_id");--> statement-breakpoint
CREATE INDEX "dossiers_organisatie_id_idx" ON "dossiers" USING btree ("organisatie_id");--> statement-breakpoint
ALTER TABLE "afspraken" ADD CONSTRAINT "afspraken_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "afspraken" ADD CONSTRAINT "afspraken_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_content_queue" ADD CONSTRAINT "ai_content_queue_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_gebruik" ADD CONSTRAINT "ai_gebruik_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_rollen_config" ADD CONSTRAINT "ai_rollen_config_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donoren" ADD CONSTRAINT "donoren_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenementen" ADD CONSTRAINT "evenementen_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorieten" ADD CONSTRAINT "favorieten_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fondsenwerving_campagnes" ADD CONSTRAINT "fondsenwerving_campagnes_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD CONSTRAINT "gesprekken_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gesprekken" ADD CONSTRAINT "gesprekken_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medische_records" ADD CONSTRAINT "medische_records_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nazorg_dagen" ADD CONSTRAINT "nazorg_dagen_begeleiding_id_begeleidingen_id_fk" FOREIGN KEY ("begeleiding_id") REFERENCES "public"."begeleidingen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pleeggezinnen" ADD CONSTRAINT "pleeggezinnen_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pleegplaatsingen" ADD CONSTRAINT "pleegplaatsingen_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sollicitaties" ADD CONSTRAINT "sollicitaties_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vrijwilligers" ADD CONSTRAINT "vrijwilligers_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "welzijn_logs" ADD CONSTRAINT "welzijn_logs_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_content_queue_organisatie_id_idx" ON "ai_content_queue" USING btree ("organisatie_id");--> statement-breakpoint
CREATE INDEX "ai_gebruik_organisatie_id_idx" ON "ai_gebruik" USING btree ("organisatie_id");--> statement-breakpoint
ALTER TABLE "afspraken" DROP COLUMN "dier_id";--> statement-breakpoint
ALTER TABLE "afspraken" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "inhoud";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "gepland_voor";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "gepubliceerd_op";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "engagement";--> statement-breakpoint
ALTER TABLE "ai_content_queue" DROP COLUMN "gemaakt_door";--> statement-breakpoint
ALTER TABLE "ai_gebruik" DROP COLUMN "module";--> statement-breakpoint
ALTER TABLE "ai_gebruik" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "ai_gebruik" DROP COLUMN "prompt_tokens";--> statement-breakpoint
ALTER TABLE "ai_gebruik" DROP COLUMN "completion_tokens";--> statement-breakpoint
ALTER TABLE "ai_gebruik" DROP COLUMN "totaal_tokens";--> statement-breakpoint
ALTER TABLE "ai_rollen_config" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "crm_contacten" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "donoren" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "evenementen" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "favorieten" DROP COLUMN "dier_id";--> statement-breakpoint
ALTER TABLE "fondsenwerving_campagnes" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "gesprekken" DROP COLUMN "dier_id";--> statement-breakpoint
ALTER TABLE "gesprekken" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "mail_log" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN "dier_id";--> statement-breakpoint
ALTER TABLE "medische_records" DROP COLUMN "dier_id";--> statement-breakpoint
ALTER TABLE "nazorg_dagen" DROP COLUMN "adoptie_id";--> statement-breakpoint
ALTER TABLE "pleeggezinnen" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "pleegplaatsingen" DROP COLUMN "dier_id";--> statement-breakpoint
ALTER TABLE "sollicitaties" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "vrijwilligers" DROP COLUMN "asiel_id";--> statement-breakpoint
ALTER TABLE "welzijn_logs" DROP COLUMN "dier_id";--> statement-breakpoint
DROP TYPE "public"."adoptie_status";--> statement-breakpoint
DROP TYPE "public"."animal_status";--> statement-breakpoint
DROP TYPE "public"."content_status";