import { sql } from 'kysely'
import { Occupation, TrxOrDb } from '../../types.ts'

export function upsert(
  trx: TrxOrDb,
  // deno-lint-ignore no-explicit-any
  opts: any,
) {
  return trx
    .insertInto('patient_occupations')
    .values(opts)
    .onConflict((oc) => oc.constraint('patient_id').doUpdateSet(opts))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function get(
  trx: TrxOrDb,
  { patient_id }: { patient_id: number },
): Promise<Occupation | undefined> {
  const patient_occupation = await trx
    .selectFrom('patient_occupations')
    .where('patient_id', '=', patient_id)
    .select(sql<Occupation>`TO_JSON(occupation)`.as('occupation'))
    .executeTakeFirst()

  return patient_occupation?.occupation
}
