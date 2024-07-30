import { Kysely } from 'kysely'
import { DB } from '../../../db.d.ts'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['premises', 'premise_supervisors'], importFromCsv)

async function importFromCsv(db: Kysely<DB>) {
  const premises = await parseCsv('./db/resources/premises.tsv', {
    columnSeparator: '\t',
  })

  const representatives = await parseCsv(
    './db/resources/premise_representatives.tsv',
    {
      columnSeparator: '\t',
    },
  )

  const premisesData = []

  for await (const premise of premises) {
    delete premise['\r']
    premisesData.push(premise)
  }

  // deno-lint-ignore no-explicit-any
  await db.insertInto('premises').values(premisesData as any).execute()

  const representativesData = []

  for await (const representative of representatives) {
    delete representative['\r']
    const { licence_number, given_name, family_name, ...resProps } =
      representative
    const premise = await db
      .selectFrom('premises')
      .select(['id', 'licence_number'])
      .where('licence_number', '=', licence_number)
      .executeTakeFirst()
    if (!premise) continue

    const pharmacist = await db
      .selectFrom('pharmacists')
      .select(['id', 'given_name', 'family_name'])
      .where('given_name', '=', given_name)
      .where('family_name', '=', family_name)
      .executeTakeFirst()

    if (!pharmacist) {
      console.warn(`Pharmacist not found: ${given_name} ${family_name}`)
      continue
    }

    representativesData.push({
      premise_id: premise.id,
      pharmacist_id: pharmacist.id,
      given_name,
      family_name,
      ...resProps,
    })
  }

  await db
    .insertInto('premise_supervisors')
    // deno-lint-ignore no-explicit-any
    .values(representativesData as any)
    .execute()
}
