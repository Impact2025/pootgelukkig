CREATE TYPE "public"."integratie_provider" AS ENUM('microsoft', 'google');--> statement-breakpoint
CREATE TABLE "externe_koppelingen" (
	"organisatie_id" text NOT NULL,
	"provider" "integratie_provider" NOT NULL,
	"account_email" varchar(255),
	"access_token_versleuteld" text NOT NULL,
	"refresh_token_versleuteld" text NOT NULL,
	"verloopt_op" timestamp NOT NULL,
	"gekoppeld_op" timestamp DEFAULT now() NOT NULL,
	"bijgewerkt_op" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "externe_koppelingen_organisatie_id_provider_pk" PRIMARY KEY("organisatie_id","provider")
);
--> statement-breakpoint
ALTER TABLE "externe_koppelingen" ADD CONSTRAINT "externe_koppelingen_organisatie_id_organisaties_id_fk" FOREIGN KEY ("organisatie_id") REFERENCES "public"."organisaties"("id") ON DELETE cascade ON UPDATE no action;