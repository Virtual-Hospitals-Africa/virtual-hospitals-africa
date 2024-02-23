// deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import parseCsv from '../../util/parseCsv.ts'

export async function up(db: Kysely<any>) {
  for await (
    const { icd9, icd10, flags } of parseCsv(
      './db/resources/icd10/2018_I9gem.csv',
    )
  ) {
    const approximate = +flags[0]
    const no_map = +flags[1]
    const combination = +flags[2]
    const scenario = +flags[3]
    const choice_list = +flags[4]
    const icd9_code= icd9.match(/.{1,3}/g)?.join(".")
    const icd10_code= no_map ? null : icd10.match(/.{1,3}/g)?.join(".")

    await db.insertInto('icd9_icd10').values({
      icd9_code,
      icd10_code,
      approximate,
      no_map,
      combination,
      scenario,
      choice_list,
    }).execute()
    
  }
}

export async function down(db: Kysely<any>) {
  await db.deleteFrom('icd9_icd10').execute()
}
