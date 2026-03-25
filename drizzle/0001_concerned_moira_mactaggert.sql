CREATE TABLE "favorieten" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dier_id" integer NOT NULL,
	"aangemaakt_op" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "alleen_thuis_score" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "budget_score" integer;--> statement-breakpoint
ALTER TABLE "favorieten" ADD CONSTRAINT "favorieten_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorieten" ADD CONSTRAINT "favorieten_dier_id_dieren_id_fk" FOREIGN KEY ("dier_id") REFERENCES "public"."dieren"("id") ON DELETE cascade ON UPDATE no action;