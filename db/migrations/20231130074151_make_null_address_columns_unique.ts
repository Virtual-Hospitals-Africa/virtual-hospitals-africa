import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('address')
    .dropConstraint('address_street_suburb_ward')
    .execute()

  await sql`
    ALTER TABLE address
    ADD CONSTRAINT address_street_suburb_ward UNIQUE NULLS NOT DISTINCT (street, suburb_id, ward_id)
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('address')
    .dropConstraint('address_street_suburb_ward')
    .execute()

  await db.schema
    .alterTable('address')
    .addUniqueConstraint('address_street_suburb_ward', [
      'street',
      'suburb_id',
      'ward_id',
    ])
    .execute()
}
