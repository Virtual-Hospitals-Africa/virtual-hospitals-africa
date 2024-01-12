import { PatientOccupation, TrxOrDb } from '../../types.ts'
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
  opts: PatientOccupation,
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

export function get(
  trx: TrxOrDb, 
  {patient_id}: { patient_id: number }
) {
  return trx
    .selectFrom('patient_occupations')
    .where('patient_id', '=', patient_id)
    .selectAll()
    .executeTakeFirst()
}
