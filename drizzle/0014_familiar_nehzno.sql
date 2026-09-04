CREATE TYPE "public"."helpdesk_bron" AS ENUM('contactformulier', 'webintake', 'widget');--> statement-breakpoint
CREATE TYPE "public"."helpdesk_status" AS ENUM('open', 'concept_klaar', 'beantwoord', 'gesloten');--> statement-breakpoint
CREATE TABLE "helpdesk_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisatie_id" text NOT NULL,
	"naam" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"onderwerp" varchar(255) NOT NULL,
	"bericht" text NOT NULL,
	"bron" "helpdesk_bron" DEFAULT 'webintake' NOT NULL,
	"status" "helpdesk_status" DEFAULT 'open' NOT NULL,
	"concept_queue_id" integer,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL,
	"beantwoord_op" timestamp
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "organisatie_id" text;--> statement-breakpoint
ALTER TABLE "helpdesk_tickets" ADD CONSTRAINT "helpdesk_tickets_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "helpdesk_tickets_organisatie_id_idx" ON "helpdesk_tickets" USING btree ("organisatie_id");--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_posts_organisatie_id_idx" ON "blog_posts" USING btree ("organisatie_id");--> statement-breakpoint
CREATE INDEX "crm_contacten_organisatie_id_idx" ON "crm_contacten" USING btree ("organisatie_id");