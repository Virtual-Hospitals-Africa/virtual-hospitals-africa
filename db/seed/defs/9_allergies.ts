import { TrxOrDb } from '../../../types.ts'
import parseJSON from '../../../util/parseJSON.ts'
import { create } from '../create.ts'

export default create(['allergies'], importFromJSON)

async function importFromJSON(trx: TrxOrDb) {
  const data: { name: string; type: string }[] = await parseJSON(
    './db/resources/allergies.json',
  )

  await trx
    .insertInto('allergies')
    .values(data.map((c) => ({ name: c.name })))
    .executeTakeFirstOrThrow()
}
