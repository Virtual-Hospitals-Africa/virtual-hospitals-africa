//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { createSeedMigration } from '../seedMigration.ts'

export default createSeedMigration([
  'conditions',
  'icd10_codes',
  'condition_icd10_codes',
], importFromJSON)

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
        id: row.key_id,
        name: row.primary_name,
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
          condition_id: row.key_id,
          icd10_code: icd10.code,
        })),
      )
      .returningAll()
      .executeTakeFirstOrThrow()
  }
}
