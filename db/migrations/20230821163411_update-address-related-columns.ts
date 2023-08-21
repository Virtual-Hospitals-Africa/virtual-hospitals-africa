import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .alterTable('patients')
    .dropColumn('country')
    .dropColumn('province')
    .dropColumn('district')
    .dropColumn('ward')
    .execute()

  await db
    .schema
    .alterTable('patients')
    .addColumn(
      'country',
      'integer',
      (col) => col.references('countries.id'),
    )
    .addColumn(
      'province',
      'integer',
      (col) => col.references('provinces.id'),
    )
    .addColumn(
      'district',
      'integer',
      (col) => col.references('districts.id'),
    )
    .addColumn(
      'ward',
      'integer',
      (col) => col.references('wards.id'),
    )
    .addColumn(
      'suburb',
      'integer',
      (col) => col.references('suburbs.id'),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db
    .schema
    .alterTable('patients')
    .dropColumn('country')
    .dropColumn('province')
    .dropColumn('district')
    .dropColumn('ward')
    .dropColumn('suburb')
    .execute()

  await db
    .schema
    .alterTable('patients')
    .addColumn('country', 'varchar(255)')
    .addColumn('province', 'varchar(255)')
    .addColumn('district', 'varchar(255)')
    .addColumn('ward', 'varchar(255)')
    .execute()
}
