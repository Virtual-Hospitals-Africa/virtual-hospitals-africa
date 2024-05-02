//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import parseJSON from '../../../util/parseJSON.ts'
import { create } from '../create.ts'

export default create(['allergies'], importFromJSON)

async function importFromJSON(db: Kysely<any>) {
  const data: { name: string; type: string }[] = await parseJSON(
    './db/resources/allergies.json',
  )

  await db
    .insertInto('allergies')
    .values(data.map((c) => ({ name: c.name })))
    .executeTakeFirstOrThrow()
}
