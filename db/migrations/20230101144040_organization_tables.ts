import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE "Organization"
    ADD CONSTRAINT "check_single_name" CHECK (array_length("name", 1) = 1)
  `.execute(db)

  await db.schema.alterTable('Organization')
    .addColumn(
      'canonicalName',
      'text',
      (col) => col.notNull(),
    )
    .execute()

  await db.schema.alterTable('Location')
    .addColumn(
      'organizationId',
      'uuid',
      (col) => col.notNull().references('Organization.id'),
    )
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`, (col) => col.notNull())
    .execute()

  await sql`
    CREATE OR REPLACE FUNCTION set_canonical_name()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."canonicalName" := New."name"[1];
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE TRIGGER set_canonical_name_trigger
    BEFORE INSERT OR UPDATE ON "Organization"
    FOR EACH ROW
    EXECUTE FUNCTION set_canonical_name();
  `.execute(db)

  await sql`
    CREATE OR REPLACE FUNCTION set_location_organization_id()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."organizationId" := substring(NEW.organization from 'Organization/(.*)');
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE TRIGGER set_location_organization_id_trigger
    BEFORE INSERT OR UPDATE ON "Location"
    FOR EACH ROW
    EXECUTE FUNCTION set_location_organization_id();
  `.execute(db)

  await sql`
    CREATE OR REPLACE FUNCTION set_location_location()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."location" := 
          ST_SetSRID(ST_MakePoint(
            (((NEW."near"::json)->'longitude')::text)::numeric,
            (((NEW."near"::json)->'latitude')::text)::numeric
          ), 4326)::geography
        ;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE TRIGGER set_location_location_trigger
    BEFORE INSERT OR UPDATE ON "Location"
    FOR EACH ROW
    EXECUTE FUNCTION set_location_location();
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('Organization').dropConstraint('check_single_name')
    .execute()

  await db.schema.alterTable('Location').dropColumn('organizationId').execute()
  await db.schema.alterTable('Location').dropColumn('canonicalName').execute()
  await db.schema.alterTable('Location').dropColumn('location').execute()
  await sql`
    DROP TRIGGER IF EXISTS set_location_organization_id_trigger on "Location"
  `.execute(db)
  await sql`
    DROP TRIGGER IF EXISTS set_location_location_trigger on "Location"
  `.execute(db)
}
