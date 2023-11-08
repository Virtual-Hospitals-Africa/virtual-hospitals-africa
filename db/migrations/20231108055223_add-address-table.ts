import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('address')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('street', 'varchar(255)')
    .addColumn('suburb_id', 'integer', (col) =>
      col.references('suburbs.id'))
    .addColumn('ward_id', 'integer', (col) =>
      col.notNull()
        .references('wards.id'))
    .addColumn('district_id', 'integer', (col) =>
      col.notNull()
        .references('districts.id'))
    .addColumn('province_id', 'integer', (col) =>
      col.notNull()
        .references('provinces.id'))
    .addColumn('country_id', 'integer', (col) =>
      col.notNull()
        .references('countries.id'))
    .addUniqueConstraint('address_street_suburb_ward', [
      'street',
      'suburb_id',
      'ward_id',
    ])
    .execute()

  await db.schema
    .alterTable('patients')
    .dropColumn('street')
    .dropColumn('suburb_id')
    .dropColumn('ward_id')
    .dropColumn('district_id')
    .dropColumn('province_id')
    .dropColumn('country_id')
    .addColumn('address_id', 'integer', (col) =>
      col.references('address.id'))
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('address').execute()
  await db.schema
    .alterTable('patients')
    .dropColumn('address_id')
    .addColumn('street', 'varchar(255)')
    .addColumn('suburb_id', 'integer', (col) =>
      col.references('suburbs.id'))
    .addColumn('ward_id', 'integer', (col) =>
      col.references('wards.id'))
    .addColumn('district_id', 'integer', (col) =>
      col.references('districts.id'))
    .addColumn('province_id', 'integer', (col) =>
      col.references('provinces.id'))
    .addColumn('country_id', 'integer', (col) =>
      col.references('countries.id'))
    .execute()
}
