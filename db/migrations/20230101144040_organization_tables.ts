import { Kysely, sql } from 'kysely'
import { upsertTrigger } from '../helpers.ts'
import { DB } from '../../db.d.ts'

const t1 = upsertTrigger('Organization', 'canonicalName', 'NEW.name[1]')

const t2 = upsertTrigger('Location', 'organizationId', `substring(NEW.organization from 'Organization/(.*)')`)

const t3 = upsertTrigger('Location', 'location', `
  ST_SetSRID(ST_MakePoint(
    (((NEW."near"::json)->'longitude')::text)::numeric,
    (((NEW."near"::json)->'latitude')::text)::numeric
  ), 4326)::geography
`)

export async function up(db: Kysely<DB>) {
  await sql`
    ALTER TABLE "Organization"
    ADD CONSTRAINT "check_single_name"
    CHECK (array_length("name", 1) = 1)
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

  await t1.create(db)
  await t2.create(db)
  await t3.create(db)
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await t3.drop(db)
  await t2.drop(db)
  await t1.drop(db)

  await db.schema.alterTable('Location').dropColumn('organizationId').execute()
  await db.schema.alterTable('Location').dropColumn('canonicalName').execute()
  await db.schema.alterTable('Location').dropColumn('location').execute()

  await db.schema.alterTable('Organization').dropConstraint('check_single_name')
    .execute()
}
