CREATE TABLE "Contact" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT NOW()
);
--> statement-breakpoint
DROP TABLE "contacts" CASCADE;