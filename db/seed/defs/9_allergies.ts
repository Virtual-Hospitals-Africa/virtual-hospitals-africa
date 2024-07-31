import { Kysely } from 'kysely'
import parseJSON from '../../../util/parseJSON.ts'
import { create } from '../create.ts'
import { DB } from '../../../db.d.ts'

export default create(['allergies'], importFromJSON)

async function importFromJSON(db: Kysely<DB>) {
  const data: { name: string; type: string }[] = await parseJSON(
    './db/resources/allergies.json',
  )

  await db
    .insertInto('allergies')
    .values(data.map((c) => ({ name: c.name })))
    .executeTakeFirstOrThrow()
}
