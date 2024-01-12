import { sql } from 'kysely'
import { TrxOrDb, Maybe, Occupation } from '../../types.ts'

//import sql from Kysley
//TODO: upsert instead of add
// export function upsert(
//   trx: TrxOrDb,
//   opts: PatientOccupation,
// ) {
//   console.log('opts', opts)
//   return trx
//     .insertInto('patient_occupations')
//     .values(opts)
//     .execute()
// }

export function upsert(
  trx: TrxOrDb,
  // deno-lint-ignore no-explicit-any
  opts: any,
) {
  //if(sql'{opts.patient_id})
  return trx
    .insertInto('patient_occupations')
    .values(opts)
    .onConflict((oc) =>
      oc.constraint('patient_id').doUpdateSet(opts)
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function get(
  trx: TrxOrDb, 
  { patient_id }: { patient_id: number }
) : Promise<Occupation | undefined> {
  const patient_occupation = await trx
    .selectFrom('patient_occupations')
    .where('patient_id', '=', patient_id)
    .select(sql<Occupation>`TO_JSON(occupation)`.as('occupation'))
    .executeTakeFirst()
  
  return patient_occupation?.occupation
}
