import { PatientMedia, ReturnedSqlRow, TrxOrDb } from './../../types.ts'
import { sql } from 'kysely'

export async function getPatientMediaCount(
  trx: TrxOrDb,
  opts: {paitent_id: number})
:Promise<number>{
  const result = await sql<number>`
  SELECT COUNT(*)
  FROM media
  WHERE patient_id = ${opts.paitent_id}`.execute(trx)
  return result.rows[0]
}

export async function getAllPatientMedia(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<ReturnedSqlRow<PatientMedia>[]> {
  return await trx.selectFrom('media').where('patient_id', '=', opts.patient_id)
    .selectAll().execute()
}
