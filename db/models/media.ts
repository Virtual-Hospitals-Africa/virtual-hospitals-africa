import { PatientMedia, ReturnedSqlRow, TrxOrDb } from './../../types.ts'
import { sql } from 'kysely'

export async function getPatientMediaCount(
  trx: TrxOrDb,
  opts: { paitent_id: number },
): Promise<number> {
  const result = await sql<number>`
    SELECT COUNT(*)
    FROM media
    WHERE patient_id = ${opts.paitent_id}
  `.execute(trx)
  return result.rows[0]
}

export async function insert(
  trx: TrxOrDb,
  opts: { file_name: string; binary_data: BinaryData; mime_type: string },
): Promise<ReturnedSqlRow<PatientMedia>> {
  return await trx.insertInto('media').values(opts).returningAll()
    .executeTakeFirstOrThrow()
}
