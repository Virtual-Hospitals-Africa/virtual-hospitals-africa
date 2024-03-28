import { Kysely } from 'kysely'
import * as inParallel from '../../util/inParallel.ts'
import parseCsv from '../../util/parseCsv.ts'
import { createSeedMigration } from '../seedMigration.ts'

export default createSeedMigration(
  ['loinc'],
  importDataFromCSV
)


async function importDataFromCSV(db: Kysely<any>) {
  await inParallel.forEach(parseCsv('./db/resources/loinc.csv', {
    lineSeparator: "\r\n"
  }), (row) => {
    Object.assign(row, {
      related_names2: row.related_names2 ? row.related_names2.split('; ') : [],
      units_required: row.units_required === 'Y'
    })
    console.log('row', row)
    return db.insertInto('loinc').values(row).execute()
  }, { concurrency: 1 })
}
