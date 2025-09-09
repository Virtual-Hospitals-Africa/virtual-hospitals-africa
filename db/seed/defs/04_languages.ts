import z from 'zod'
import { parseCsvTyped } from '../../../util/parseCsv.ts'
import { create } from '../create.ts'

export default create([
  'iso_639_1_languages',
  'iso_639_2_b_languages',
], async (trx) => {
  for await (
    const row of parseCsvTyped(
      './db/resources/languages/language-codes-3b2.csv',
      z.object({
        'alpha3-b': z.string().length(3),
        'alpha2': z.string().length(2),
        'English': z.string(),
      }),
    )
  ) {
    await trx.insertInto('iso_639_1_languages').values({
      iso_639_1: row['alpha2'],
      english_name: row['English'],
    }).execute()

    await trx.insertInto('iso_639_2_b_languages').values({
      iso_639_2_b: row['alpha3-b'],
      iso_639_1: row['alpha2'],
      english_name: row['English'],
    }).execute()
  }
}, { never_dump: true })
