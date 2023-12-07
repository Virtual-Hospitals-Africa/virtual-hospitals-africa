//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import parseJSON from '../../util/parseJSON.ts'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('conditions')
    .addColumn('key_id', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('primary_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('term_icd9_code', 'varchar(255)')
    .addColumn('term_icd9_text', 'varchar(255)')
    .addColumn('consumer_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_procedure', 'boolean', (col) => col.notNull())
    .addColumn('info_link_href', 'varchar(255)')
    .addColumn('info_link_text', 'varchar(255)')
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('icd10_codes')
    .addColumn('code', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('condition_icd10_codes')
    .addColumn('condition_key_id', 'varchar(255)', (col) =>
      col.notNull()
        .references('conditions.key_id')
        .onDelete('cascade'))
    .addColumn('icd10_code', 'varchar(255)', (col) =>
      col.notNull()
        .references('icd10_codes.code')
        .onDelete('cascade'))
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await addUpdatedAtTrigger(db, 'conditions')
  await addUpdatedAtTrigger(db, 'icd10_codes')
  await addUpdatedAtTrigger(db, 'condition_icd10_codes')
  await importFromJSON(db)
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('condition_icd10_codes').execute()
  await db.schema.dropTable('icd10_codes').execute()
  await db.schema.dropTable('conditions').execute()
}

async function importFromJSON(db: Kysely<any>) {
  const data = await parseJSON(
    './db/resources/cond_proc_download.json',
  )

  for (const row of data) {
    /*
      Populate conditions db, conditions_icd10_codes db and
      icd10_codes db from the conditions json file
    */
    const [info_link_href, info_link_text] = row.info_link_data[0] || []
    await db.insertInto('conditions')
      .values({
        key_id: row.key_id,
        primary_name: row.primary_name,
        term_icd9_code: row.term_icd9_code,
        term_icd9_text: row.term_icd9_text,
        consumer_name: row.consumer_name,
        is_procedure: row.is_procedure,
        info_link_href,
        info_link_text,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    if (!row.icd10cm || !row.icd10cm.length) {
      continue
    }

    await db.insertInto('icd10_codes')
      .values(
        row.icd10cm.map((icd10: any) => ({
          code: icd10.code,
          name: icd10.name,
        })),
      )
      .onConflict((oc) => oc.column('code').doNothing())
      .returningAll()
      .execute()

    await db.insertInto('condition_icd10_codes')
      .values(
        row.icd10cm.map((icd10: any) => ({
          condition_key_id: row.key_id,
          icd10_code: icd10.code,
        })),
      )
      .returningAll()
      .executeTakeFirstOrThrow()
  }
}
