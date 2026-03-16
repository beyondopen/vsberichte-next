import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Payload schema changes: language field + document_type enum update
  await db.execute(sql`
   CREATE TYPE "public"."enum_documents_language" AS ENUM('de', 'en');
  ALTER TABLE "documents" ALTER COLUMN "document_type" SET DATA TYPE text;
  ALTER TABLE "documents" ALTER COLUMN "document_type" SET DEFAULT 'jahresbericht'::text;
  DROP TYPE "public"."enum_documents_document_type";
  CREATE TYPE "public"."enum_documents_document_type" AS ENUM('jahresbericht', 'kurzfassung', 'lagebild', 'broschuere', 'kompendium', 'flyer', 'parlamentarisch');
  ALTER TABLE "documents" ALTER COLUMN "document_type" SET DEFAULT 'jahresbericht'::"public"."enum_documents_document_type";
  ALTER TABLE "documents" ALTER COLUMN "document_type" SET DATA TYPE "public"."enum_documents_document_type" USING "document_type"::"public"."enum_documents_document_type";
  ALTER TABLE "documents" ADD COLUMN "language" "enum_documents_language" DEFAULT 'de' NOT NULL;`)

  // Custom search tables (not managed by Payload collections)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "document" (
      "id" serial PRIMARY KEY,
      "year" integer,
      "title" varchar,
      "jurisdiction" varchar,
      "file_url" varchar UNIQUE,
      "num_pages" integer,
      "document_type" varchar DEFAULT 'jahresbericht',
      "language" varchar DEFAULT 'de',
      "payload_id" integer
    );

    CREATE TABLE IF NOT EXISTS "document_page" (
      "id" serial PRIMARY KEY,
      "document_id" integer NOT NULL REFERENCES "document"("id"),
      "page_number" integer,
      "content" text,
      "file_url" varchar UNIQUE,
      "search_vector" tsvector
    );

    CREATE INDEX IF NOT EXISTS "ix_document_page_search_vector"
      ON "document_page" USING gin("search_vector");

    CREATE OR REPLACE FUNCTION document_page_search_vector_update() RETURNS trigger AS $tr$
    BEGIN
      NEW.search_vector := to_tsvector('pg_catalog.german', COALESCE(NEW.content, ''));
      RETURN NEW;
    END;
    $tr$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS document_page_search_vector_trigger ON "document_page";
    CREATE TRIGGER document_page_search_vector_trigger
      BEFORE INSERT OR UPDATE OF content ON "document_page"
      FOR EACH ROW EXECUTE FUNCTION document_page_search_vector_update();

    CREATE TABLE IF NOT EXISTS "token_count" (
      "id" serial PRIMARY KEY,
      "document_id" integer NOT NULL REFERENCES "document"("id"),
      "token" varchar,
      "count" integer
    );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop search tables
  await db.execute(sql`
    DROP TABLE IF EXISTS "token_count";
    DROP TABLE IF EXISTS "document_page";
    DROP TABLE IF EXISTS "document";
    DROP FUNCTION IF EXISTS document_page_search_vector_update;
  `)

  // Revert Payload schema changes
  await db.execute(sql`
   ALTER TYPE "public"."enum_documents_document_type" ADD VALUE 'english' BEFORE 'parlamentarisch';
  ALTER TABLE "documents" DROP COLUMN "language";
  DROP TYPE "public"."enum_documents_language";`)
}
