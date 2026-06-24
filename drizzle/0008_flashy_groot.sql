CREATE TYPE "public"."blog_status" AS ENUM('concept', 'gepubliceerd', 'gearchiveerd');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('procent', 'vast');--> statement-breakpoint
CREATE TYPE "public"."crm_activiteit_type" AS ENUM('notitie', 'mail', 'bel', 'taak', 'afspraak');--> statement-breakpoint
CREATE TYPE "public"."crm_contact_type" AS ENUM('lead', 'asiel', 'adoptant', 'partner', 'overig');--> statement-breakpoint
CREATE TYPE "public"."crm_deal_fase" AS ENUM('nieuw', 'contact', 'onderhandeling', 'gewonnen', 'verloren');--> statement-breakpoint
CREATE TYPE "public"."mail_status" AS ENUM('verzonden', 'gefaald', 'geopend', 'gebounced');--> statement-breakpoint
CREATE TABLE "ai_gebruik" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" varchar(50) NOT NULL,
	"user_id" integer,
	"asiel_id" integer,
	"model" varchar(100) NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"totaal_tokens" integer DEFAULT 0 NOT NULL,
	"kosten_euro" real DEFAULT 0 NOT NULL,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_instellingen" (
	"sleutel" varchar(100) PRIMARY KEY NOT NULL,
	"waarde" json,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categorieen" (
	"id" serial PRIMARY KEY NOT NULL,
	"naam" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	CONSTRAINT "blog_categorieen_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"titel" varchar(255) NOT NULL,
	"slug" varchar(280) NOT NULL,
	"inhoud_md" text NOT NULL,
	"excerpt" text,
	"cover_url" text,
	"categorie_id" integer,
	"status" "blog_status" DEFAULT 'concept' NOT NULL,
	"meta_title" varchar(255),
	"meta_description" varchar(320),
	"focus_keyword" varchar(120),
	"seo_score" integer DEFAULT 0 NOT NULL,
	"interne_links" json DEFAULT '[]'::json,
	"externe_links" json DEFAULT '[]'::json,
	"auteur_id" integer,
	"gepubliceerd_op" timestamp,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupon_inwisselingen" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"user_id" integer,
	"email" varchar(255),
	"bedrag_korting" real DEFAULT 0 NOT NULL,
	"ingewisseld_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(60) NOT NULL,
	"omschrijving" varchar(255),
	"type" "coupon_type" DEFAULT 'procent' NOT NULL,
	"waarde" real NOT NULL,
	"max_gebruik" integer,
	"gebruikt_aantal" integer DEFAULT 0 NOT NULL,
	"per_klant_limiet" integer,
	"min_besteding" real,
	"campagne" varchar(120),
	"actief" boolean DEFAULT true NOT NULL,
	"start_op" timestamp,
	"verval_op" timestamp,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "crm_activiteiten" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"deal_id" integer,
	"type" "crm_activiteit_type" DEFAULT 'notitie' NOT NULL,
	"inhoud" text NOT NULL,
	"auteur" varchar(120),
	"voltooid" boolean DEFAULT false NOT NULL,
	"deadline" timestamp,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contacten" (
	"id" serial PRIMARY KEY NOT NULL,
	"naam" varchar(255) NOT NULL,
	"email" varchar(255),
	"telefoon" varchar(30),
	"bedrijf" varchar(255),
	"type" "crm_contact_type" DEFAULT 'lead' NOT NULL,
	"bron" varchar(80) DEFAULT 'handmatig' NOT NULL,
	"stad" varchar(100),
	"eigenaar" varchar(120),
	"tags" json DEFAULT '[]'::json,
	"notitie" text,
	"asiel_id" integer,
	"user_id" integer,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"titel" varchar(255) NOT NULL,
	"fase" "crm_deal_fase" DEFAULT 'nieuw' NOT NULL,
	"waarde" real DEFAULT 0,
	"eigenaar" varchar(120),
	"sluitingsdatum" timestamp,
	"volgorde" integer DEFAULT 0 NOT NULL,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mail_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"naar" varchar(255) NOT NULL,
	"van" varchar(255),
	"onderwerp" text NOT NULL,
	"template" varchar(80),
	"status" "mail_status" DEFAULT 'verzonden' NOT NULL,
	"resend_id" varchar(100),
	"contact_id" integer,
	"asiel_id" integer,
	"user_id" integer,
	"fout" text,
	"verzonden_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_gebruik" ADD CONSTRAINT "ai_gebruik_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_categorie_id_blog_categorieen_id_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."blog_categorieen"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_inwisselingen" ADD CONSTRAINT "coupon_inwisselingen_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_inwisselingen" ADD CONSTRAINT "coupon_inwisselingen_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activiteiten" ADD CONSTRAINT "crm_activiteiten_contact_id_crm_contacten_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contacten"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activiteiten" ADD CONSTRAINT "crm_activiteiten_deal_id_crm_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."crm_deals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contacten" ADD CONSTRAINT "crm_contacten_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_contact_id_crm_contacten_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."crm_contacten"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_log" ADD CONSTRAINT "mail_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;