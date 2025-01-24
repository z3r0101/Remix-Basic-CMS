CREATE TABLE "contacts" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"message" text,
	"created_at" timestamp DEFAULT 'now()'
);
