import { sql } from 'kysely'
import { Lifestyle, TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'

export function upsert(
  trx: TrxOrDb,
  // deno-lint-ignore no-explicit-any
  opts: any,
) {
  console.log('opts: ', opts)
  return trx
    .insertInto('patient_lifestyle')
    .values(opts.lifestyle)
    .onConflict((oc) => oc.constraint('patient_id').doUpdateSet(opts.lifestyle))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: number },
): Promise<Lifestyle | undefined> {
  const patient_lifestyle = await trx
    .selectFrom('patient_lifestyle')
    .where('patient_id', '=', patient_id)
    .select(
      jsonBuildObject({
        sexual_activity: sql<
          Lifestyle['sexual_activity']
        >`TO_JSON(sexual_activity)`,
        alcohol: sql<Lifestyle['alcohol']>`TO_JSON(alcohol)`,
        smoking: sql<Lifestyle['smoking']>`TO_JSON(smoking)`,
      }).as('lifestyle'),
    )
    .executeTakeFirst()
  return patient_lifestyle?.lifestyle
}
