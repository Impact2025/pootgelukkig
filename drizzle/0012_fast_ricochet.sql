CREATE TYPE "public"."kenniskluis_status" AS ENUM('verwerkt', 'mislukt');--> statement-breakpoint
CREATE TABLE "kenniskluis_documenten" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisatie_id" text NOT NULL,
	"bestandsnaam" varchar(255) NOT NULL,
	"blob_url" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"grootte_bytes" integer NOT NULL,
	"tekst_inhoud" text,
	"status" "kenniskluis_status" DEFAULT 'verwerkt' NOT NULL,
	"foutmelding" text,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kenniskluis_documenten" ADD CONSTRAINT "kenniskluis_documenten_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kenniskluis_documenten_organisatie_id_idx" ON "kenniskluis_documenten" USING btree ("organisatie_id");