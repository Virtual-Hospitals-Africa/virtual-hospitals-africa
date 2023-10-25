import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('patients').renameColumn('country', 'country_id')
    .execute()
  await db.schema.alterTable('patients').renameColumn('province', 'province_id')
    .execute()
  await db.schema.alterTable('patients').renameColumn('district', 'district_id')
    .execute()
  await db.schema.alterTable('patients').renameColumn('ward', 'ward_id')
    .execute()
  await db.schema.alterTable('patients').renameColumn('suburb', 'suburb_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('patients').renameColumn('country_id', 'country')
    .execute()
  await db.schema.alterTable('patients').renameColumn('province_id', 'province')
    .execute()
  await db.schema.alterTable('patients').renameColumn('district_id', 'district')
    .execute()
  await db.schema.alterTable('patients').renameColumn('ward_id', 'ward')
    .execute()
  await db.schema.alterTable('patients').renameColumn('suburb_id', 'suburb')
    .execute()
}
