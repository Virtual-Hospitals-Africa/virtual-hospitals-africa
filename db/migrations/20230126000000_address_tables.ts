import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('countries')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addUniqueConstraint('country_name', ['name'])
    .execute()

  await db.schema
    .createTable('provinces')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('country_id', 'integer', (col) =>
      col.notNull()
        .references('countries.id')
        .onDelete('cascade'))
    .addUniqueConstraint('province_name', ['name'])
    .execute()

  await db.schema
    .createTable('districts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('province_id', 'integer', (col) =>
      col.notNull()
        .references('provinces.id')
        .onDelete('cascade'))
    .addUniqueConstraint('district_name', ['name', 'province_id'])
    .execute()

  await db.schema
    .createTable('wards')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('district_id', 'integer', (col) =>
      col.notNull()
        .references('districts.id')
        .onDelete('cascade'))
    .addUniqueConstraint('ward_name', ['name', 'district_id'])
    .execute()

  await db.schema
    .createTable('suburbs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('ward_id', 'integer', (col) =>
      col.notNull()
        .references('wards.id')
        .onDelete('cascade'))
    .addUniqueConstraint('suburb_name', ['name', 'ward_id'])
    .execute()

  await db.schema
    .createTable('address')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('street', 'varchar(255)')
    .addColumn('suburb_id', 'integer', (col) => col.references('suburbs.id'))
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
    .execute()

  await sql`
    ALTER TABLE address
    ADD CONSTRAINT address_street_suburb_ward
    UNIQUE NULLS NOT DISTINCT (street, suburb_id, ward_id)
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('address').execute()
  await db.schema.dropTable('suburbs').execute()
  await db.schema.dropTable('wards').execute()
  await db.schema.dropTable('districts').execute()
  await db.schema.dropTable('provinces').execute()
  await db.schema.dropTable('countries').execute()
}
