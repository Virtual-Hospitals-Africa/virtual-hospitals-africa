import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('countries')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addUniqueConstraint('country_name', ['name'])
    .execute()

  await db.schema
    .createTable('provinces')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('country_id', 'uuid', (col) =>
      col.notNull()
        .references('countries.id')
        .onDelete('cascade'))
    .addUniqueConstraint('province_name', ['name'])
    .execute()

  await db.schema
    .createTable('districts')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('province_id', 'uuid', (col) =>
      col.notNull()
        .references('provinces.id')
        .onDelete('cascade'))
    .addUniqueConstraint('district_name', ['name', 'province_id'])
    .execute()

  await db.schema
    .createTable('wards')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('district_id', 'uuid', (col) =>
      col.notNull()
        .references('districts.id')
        .onDelete('cascade'))
    .addUniqueConstraint('ward_name', ['name', 'district_id'])
    .execute()

  await db.schema
    .createTable('suburbs')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('ward_id', 'uuid', (col) =>
      col.notNull()
        .references('wards.id')
        .onDelete('cascade'))
    .addUniqueConstraint('suburb_name', ['name', 'ward_id'])
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('suburbs').execute()
  await db.schema.dropTable('wards').execute()
  await db.schema.dropTable('districts').execute()
  await db.schema.dropTable('provinces').execute()
  await db.schema.dropTable('countries').execute()
}
